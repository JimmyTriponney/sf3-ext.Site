// Partie à externalisée pour la search bar
class searchWidget {

	done(response, status, xhr) {
        $.each( response, (k,v) => { this.addSelect(v,k) } );
        this.initSearch();
	}

    initSearch(){
        isActif = false;
        $('.ja-search-widget').find('input, select').each( function(){
            if( $(this).attr('value') && $(this).attr('name') !== 'stock' ){
                isActif = true
                //$(this).trigger('change');
            }
        } );
        
        if( isActif ){
            $('.ja-search-widget').find('input, select').trigger('change');
        }
    }

	addSelect(jsonOptions, name){
		let htmlOptions = '',
            dinamycSelectActive = false,
            currentSelect = $('.ja-search-widget-input[name="'+name+'"]'),
            value = currentSelect.attr('value');

        if( value ) value = value.split(',');


		$.each( jsonOptions, (k,v) => {

			if( $.type(v) === 'array' || $.type(v) === 'object' ){
				if( !dinamycSelectActive ){
					this.dinamycSelect(prevSelect, currentSelect, jsonOptions);
					dinamycSelectActive = true;
				}
			}
			else{
                selected = false;

                if( $.inArray( $.trim(v).toLowerCase(), value ) > -1 ){
                    selected = true;
                }

                htmlOptions += this.createOption(k, v, selected);
            }
            
		});

		if(htmlOptions) currentSelect.html( '<option></option>'+htmlOptions );
		
		//currentSelect.trigger('change');

		prevSelect = currentSelect;
	}

	dinamycSelect( masterSelect, slaveSelect, allOptions ){
		$(masterSelect).on('change', () => {
			masterSelectVal = $(masterSelect).val();
            slaveSelectName = $(slaveSelect).attr('name');
              
            if( masterSelectVal instanceof Array ){
                options = {};

                $.each(masterSelectVal, function(k,v){
                    $.each(allOptions[v], (key, value) => {
                        options[key] = value;
                    });
                });

                this.addSelect(options, slaveSelectName);
            }
            else{
                this.addSelect(allOptions[masterSelectVal], slaveSelectName);
            }

		});
    }

	createOption(value, label, selected){
		return '<option value="'+value+'" '+( selected ? 'selected' : '' )+'>'+label+'</option>';
	}

}


















/*
    Html à mettre : <div class="range-container"></div>

    new searchWidgetRange({
        rangeContainer 	: //Sélecteur css du block contenant le range
        rangeButtons	: //Nombre de boutons sur le slider (max. 2)
        ContainerHeight	: //Hauteur du slider de range
        buttonsHeight	: //Hauteur du bouton
        classButtons	: //Class qui seront appliqué aux boutons
        cssButtons		: //Objet de style css des boutons
        cssContainer	: //Objet de style css du slider
    });
*/ 
$.fn.searchWidgetRange = function( data = null){

    // Variables système
    let
        rangeContainer  = $(this),
        inputMin        = $(rangeContainer.attr('input-min')),
        inputMax        = $(rangeContainer.attr('input-max')),
        valueMin        = rangeContainer.attr('value-min'),
        valueMax        = rangeContainer.attr('value-max'),
        valueStep       = rangeContainer.attr('value-step'),
        rangeButtons 	= data && data.rangeButtons ? data.rangeButtons : 2,
        containerHeight = data && data.containerHeight ? data.containerHeight : '10px',
        buttonsHeight	= data && data.buttonsHeight ? data.buttonsHeight : '20px',
        classButtons	= data && data.classButtons ? data.classButtons : 'range-btn',
        cssButtons		= data && data.cssButtons ? data.cssButtons : {
                width 			: '15px',
                height			: '15px',
                border			: '1px grey solid',
                'border-radius'	: '100%'
            },
        cssContainer= data && data.cssContainer ? data.cssContainer : {
                position 		: 'relative',
                width			: '100%',
                height			: '10px',
                border			: '1px grey solid',
                'border-radius'	: '5px',
                margin          : '40px 20px'
            },

        htmlButton		= '<div class="'+classButtons+'"></div>',
        classProgress   = 'range-progress',
        htmlProgress    = '<div class="'+classProgress+'"></di>',
        classPopUp      = 'range-popup',
        htmlPopUp       = '<div class="'+classPopUp+'"></div>',
        classMaxButton	= 'range-max',
        classMinButton	= 'range-min',
        mouseUpActif	= false,
        domButton		= {},
        valueBtn        = { min : 0, max : 100},
        curAddActions	= null,
        progress        = null,
        popUp           = null,
        curBtnMove      = null;

    addButtons();
    addProgress();
    addActions();
    addViewStateFilter();
    initValue();

    function initValue(){
        setTimeout(() => {
            if( valMin = inputMin.val() ){
                curBtnMove = rangeContainer.find('.'+classMinButton);
                onMoveCursor( calculValueToPerc(valMin) , curBtnMove );
            }
            if( valMax = inputMax.val() ){
                curBtnMove = rangeContainer.find('.'+classMaxButton);
                onMoveCursor( calculValueToPerc(valMax) , curBtnMove );
            }
        }, 100);
    }
    
    function addViewStateFilter(){
        html = '<div style="position:absolute;top:-30px;left:10px;color:grey;" class="text-muted"><span class="range-view-min">Min</span> - <span class="range-view-max">Max</span></div>';
        rangeContainer
                .prepend(html);
    }

    //Ajout d'une barre de couleur sur l'interval valid
    function addProgress(){
        progress = $(htmlProgress);
        progress
            .css({
                position    : 'absolute',
                height      : '100%',
                width       : '100%',
                'font-weight' : 900,
                top         : 0,
                left        : 0
            });

        rangeContainer.prepend(progress);
    }

    function moveProgress(valuePos){
        let newCss          = {};

        newCss.width = ( 100 - valueBtn.min - ( 100 - valueBtn.max ) ) +'%';

        if( curBtnMove.is('.'+classMinButton)) { newCss.left = valuePos+'%'; }

        progress.css(newCss);
    }

    //Ajouts des boutons
    function addButtons(){

        //Je vide la partie de ce DOM pour éviter les multi déclarations
        rangeContainer.empty();

        //Ajout du style au slider
        rangeContainer
            .css({
                position 	: 'relative',
                height 		: containerHeight,
                width 		: '100%'
            })
            .css(cssContainer);

        //Ajout des boutons
        for(i = 0; i < rangeButtons; i++){

            //Enregistrement du dom dans un objet
            domButton[i] = $(htmlButton);

            //Mise en place des style du du bouton
            domButton[i]
                .css(cssButtons);

            //Positionnement du bouton
            domButton[i]
                .css({
                    position 	: 'absolute',
                    top			: ( ( rangeContainer.height() - domButton[i].height() ) / 2 )+'px',
                    left		: i ? '99%' : '-'+( domButton[i].width() / 2 )+'px'
                });
                
            //Ajout du boutons au dom
            rangeContainer
                .append( domButton[i].addClass( i > 0 ? classMaxButton : classMinButton ) );
        }
    }


    //Implémentation des actions
    function addActions(){
        let i = 0;
        while( curButton = domButton[i++] ){
            curButton.on('mousedown', onMouseDown );
        }
    }

    //Ajout de la popup avec la valeur courante
    function addPopUp(){
        if( !$('.'+classPopUp).length ){
            popUp = $(htmlPopUp);
            popUp.css({
                position : 'absolute',
                padding : '10px 20px',
                'border-radius' : '5px',
                border : '1px grey solid',
                color : 'grey',
                background : 'white'
            });
            $('body').append(popUp);
        }
    }
    function deletePopUp(){
        popUp.remove();
    }

    function changeDataPopUp(data, left = popUp.left(), top = popUp.top() ){
        popUp.html(data);
        popUp.css({
            left : left+'px',
            top : top+'px'
        });
    }

    function changeDataView(data, type){
        rangeContainer.find('.range-view-'+type).html(data);
    }

    //Déclaration des actions
    //Au clic sur une poigné
    function onMouseDown(){
        mouseUpActif = false;
        curBtnMove  = $(this);

        $(document)
            .on('mousemove', $(this), onMouseMove )
            .on('mouseup', onMouseUp);
    }

    //Au déplacement de la souri après le clic
    function onMouseMove(e){
        let 
        screenX 	= e.screenX,
        screenY 	= e.screenY,
        btn 		= $(e.data[0]),
        slider		= btn.parent(),
        sliderX 	= slider.offset().left,
        sliderWidth = slider.width(),
        newBtnX 	= ((screenX-sliderX)/(sliderWidth))*100;

        if(!mouseUpActif){
            onMoveCursor(newBtnX,btn, e);
        }
        else{
            $(document).off('mousemove', onMouseMove);
        }
    }

    function calculValueToPerc(value){
        position = ( (value - valueMin) / (valueMax - valueMin) ) * 100;
        return position;
    }

    //Suite
    function onMoveCursor(value, btnTarget, e){
        
        let
        minMoveInSlider = 0,
        maxMoveInSlider = 100,
        step            = (valueStep/(valueMax-valueMin))*100;
        typeBtn         = btnTarget.is('.'+classMinButton) ? 'min' : 'max',
        btnWidth		= btnTarget.width(),
        sliderWidth		= rangeContainer.width(),

        btnMinPos       = parseInt( rangeContainer.find('.'+classButtons+'.'+classMinButton).css('left') ),
        btnMaxPos       = parseInt( rangeContainer.find('.'+classButtons+'.'+classMaxButton).css('left') ),
        btnMinPosPer    = ( btnMinPos / sliderWidth ) *100,
        btnMaxPosPer    = ( btnMaxPos / sliderWidth ) *100;

        //Testing next position button
        value = value < minMoveInSlider ? minMoveInSlider : value;
        value = value > maxMoveInSlider ? maxMoveInSlider : value;

        //Contraindre la valeur en fonction du step
        value = Math.round(value/step) * step;

        //Eviter de depasser l'autre poigné
        if(typeBtn === 'min'){
            value = value >= valueBtn.max+step ? valueBtn.max-step : value;
            valueBtn.min = value;
        }
        else if(typeBtn === 'max'){
            value = value <= valueBtn.min+step ? valueBtn.min+step : value;
            valueBtn.max = value;
        }

        //Déplacement de la barre de range actif
        moveProgress(value);

        btnTarget
            .css({
                'left'	: (value - ( (btnWidth/2)/sliderWidth*100 ) )+'%'
            });

        let data = calculValue(value);

        
        if(e !== undefined){
            addPopUp();
            changeDataPopUp(data, e.clientX, e.clientY);
        }
    }

    //Au relachament du clic
    function onMouseUp(){
        mouseUpActif = true;
        $(document).off('mousemove', onMouseMove);
        curBtnMove = null;
        deletePopUp();
    }

    //Calule la valeur à mettre dans l'input
    function calculValue(value){
        delta = valueMax-valueMin;
        let type;
        valueInput = !value || value === 100 ? '' : Math.round( delta * ( value/100 ) ) + parseInt(valueMin);

        if( curBtnMove.is('.'+classMinButton) ){
            type = 'min';
            inputMin.attr('value', valueInput);
            valueBtn.min = value;
            valueInput = !valueInput ? '0' : valueInput;
            inputMin.trigger('change');
        }
        else if( curBtnMove.is('.'+classMaxButton) ){
            type = 'max';
            inputMax.attr('value', valueInput);
            valueBtn.max = value;
            valueInput = !valueInput ? valueMax+' & +' : valueInput;
            inputMax.trigger('change');
        }

        changeDataView(valueInput,type);

        return valueInput;
    }


};
/* end search widget slider range */


































/* Search widget : panel showing */
/*

    exemple de html :
                    <li class="ja-search-widget-filter">
                        <span class="ja-search-widget-title">
                            Silhouette <i class="fas fa-chevron-down"></i>
                        </span>
                        <span class="ja-search-widget-filter-value">
                            <select name="body" class="ja-search-widget-input">
                            </select>                             
                        </span>
                    </li>


    data = {
        classPanel      : // Class du panneau de sélection de filtre qui s'affiche au clique
        cssPanel        : // Css qui sera appliqué au panneau de sélection de filtre
    }

*/
$.fn.sWidgetShowPanel = function(data = null){

    let
        btnFilter       = $(this),
        classPanel      = data && data.classPanel ? data.classPanel : 'search-widget-panel',

        cssPanel        = data && data.cssPanel ? data.cssPanel : {
                background      : 'white',
                'border-top'    : '1px grey solid',
                color           : 'grey'
            },
        
        classFilter     = 'search-widget-panel-filter',
        classCheckbox   = 'search-widget-checkbox',
        classLabel      = 'search-widget-label',
        section         = $.trim(btnFilter.find('.ja-search-widget-title').text()),
        htmlPanel       = '<div class="'+classPanel+' row"></div>',
        htmlOptionFilter= '<div class="'+classFilter+' col-lg-3 col-md-4 col-6" value=""><div class="'+classCheckbox+'"></div><div class="'+classLabel+'"></div></div>',

        timeAnim        = 200,
        domPanel        = null,
        Panel           = null,
        input           = null,
        filter          = {}
    ;


    init();

    function init(){
        btnFilter.attr('active',true);
        btnFilter.off('click', onClickBtnFilter);
        btnFilter.on('click', onClickBtnFilter);
        $('body').off('click', bodyHidePanel);
        $('body').on('click', bodyHidePanel);
        btnFilter.find('input, select').off('change', updateFilterActif);
        btnFilter.find('input, select').on('change', updateFilterActif);
    }

    function bodyHidePanel(e){
        if( !$(e.target).closest('.ja-search-widget').length ){
            if( $('.'+classPanel).length ){
                hidePanel();
            }
        }
    }

    function onClickBtnFilter(){

        keepOnePanel();

        isNewPanel = !$('.'+classPanel).is('[section="'+section+'"]');

        hidePanel();

        if( isNewPanel ){
            
            setTimeout(() => {
                createPanel();
                completPanel();
                showPanel();
            }, $('.'+classPanel).css('display') === 'none' || !$('.'+classPanel).length ? 0 : timeAnim);

            $(this).find('.fa-chevron-down').addClass('rotate180');
        }
        
    }

    function hidePanel(){
        
        $('.ja-search-widget-items').find('.fa-chevron-down').removeClass('rotate180');
        keepOnePanel();
        $('.'+classPanel).attr('section','');
        $('.'+classPanel).slideUp(timeAnim);
    }

    function createPanel(){
        keepOnePanel();

        Panel = $(htmlPanel)
                .css({
                    width         : '100%'
                })
                .css(cssPanel)
                .css({display : 'none'});

        
        
        if( !$('.'+classPanel).length ) $('.ja-search-widget').append(Panel);
        
        keepOnePanel();

        $('.'+classPanel).attr('section', section);

    }

    function completPanel(){
        keepOnePanel();
        $('.'+classPanel).empty();

        recoverFilterPanel();

        if(filter instanceof $){
            $('.'+classPanel).append(filter);
            filter.searchWidgetRange();
        }
        else{

            $.each(filter, function(key, option){
                let oneFilter = $(htmlOptionFilter)
                                .attr('value', option.value)
                                .find('.'+classLabel)
                                .text(option.label)
                                .parent();
                                
                oneFilter.on('click', onSelectFilter);
                
                if(option.selected){
                    oneFilter.find('.'+classCheckbox).addClass('selected');
                }
                
                $('.'+classPanel).append( oneFilter );
            });

        }
    }

    function onSelectFilter(){
        keepOnePanel();

        isMultiple  = btnFilter.find('select').is('[multiple]');
        isSelected  = $(this).find('.'+classCheckbox).is('.selected');
        value       = $(this).attr('value');
        valueInput  = btnFilter.find('select').val();

        if( isMultiple ){
            if( isSelected ) valueInput.splice( $.inArray(value, valueInput), 1 );
            else valueInput.push(value);
            btnFilter.find('select').val(valueInput);
        }
        else{
            if( isSelected )  btnFilter.find('select').val('');
            else  btnFilter.find('select').val(value);

            $('.'+classPanel).find('.'+classCheckbox).removeClass('selected');
        }

        $(this).find('.'+classCheckbox).toggleClass('selected');
        
        btnFilter.find('select').trigger('change');
    }

    function updateFilterActif(){

        $('.ja-search-widget').find('.ja-search-widget-active-filter').empty();

        $('.ja-search-widget').find('select,input').each( function(){

           

            val = recoverValue( $(this) );
            name = $(this).attr('name');

            if(val){
                showFilterActif(name,val);
            }
            
        } );
    }

    function recoverValue(node){
        val = [];
        name = node.attr('name');

        if( node.is('select') ){
            if( $.type(node.val()) == 'array' ){
                valTab = node.val();
                $.each(valTab, function(k,v){
                    val.push($('select[name="'+name+'"] option[value="'+v+'"]').html());
                });
            }
            else{
                val.push($('select[name="'+name+'"] option[value="'+val+'"]').html());
            }
        }
        else{
            val.push($('input[name="'+name+'"]').val());
        }

        if( val.length ) val = val.join(', ');
        else val = false

        return val;
    }

    function showFilterActif(name,val){
        translate = {
            body: 'Silhouette',
            brand: 'Marque',
            brandModel: 'Modèle',
            yearMin: 'Année min.',
            yearMax: 'Année max.',
            energy: 'Energie',
            priceMin: 'Prix min.',
            priceMax: 'Prix max.',
            kmMin: 'Km min.',
            kmMax: 'Km max.',
            trans: 'Boîte',
            color: 'Couleur',
            chMin: 'Ch min.',
            chMax: 'Ch max.',
            location: 'Département'
        };

        if(translate[name] === undefined){
            return null;
        }

        if( $('.actif-filter[name="'+name+'"]').length ){
            $('.actif-filter[name="'+name+'"]').parent().remove();
            removeFilter(null, $('.actif-filter[name="'+name+'"]') );
        }

        html = '<div class="col-auto"><div class="actif-filter" title="Cliquez pour supprimer ce filtre" name="'+name+'"> '+translate[name]+' : <span class="value">'+val+'</span></div></div>';
        html = $(html);
        
        $(html).find('.actif-filter').off('click', removeFilter);
        $(html).find('.actif-filter').on('click', removeFilter);

        $('.ja-search-widget').find('.ja-search-widget-active-filter').append( html );

    }

    function removeFilter(e = null, $that = null){
        

        $this = $that !== null ? $that : $(this);

        name = $this.attr('name');

        $(this).parent().animate({transform: 'scale(0)'}, 2000);
        
        $('.ja-search-widget').find('input[name="'+name+'"], select[name="'+name+'"]').each( function(){
        
            if( $this.is('select') ){
                $(this).find('option:selected').removeAttr('selected');            
            }
            else{
                $(this).val('');
            }

            $(this).trigger('change');
        });

        $this.parent().remove();
    }

    function recoverFilterPanel(){
        keepOnePanel();

        filter = {};
        
        //Si le contenu est un panneau déja fait
        if( btnFilter.find('.ja-search-widget-panel').length ){
            filter = $(btnFilter.find('.ja-search-widget-panel').html());
        }
        //Si le contenu provient d'un select
        else if( btnFilter.find('select.ja-search-widget-input').length ){
            input       = btnFilter.find('select.ja-search-widget-input');
            
            input.find('option').each(function(){
                if( value = $(this).attr('value') ){
                    filter[ value ] = { value : value,
                                        label : $(this).text(),
                                        selected : $(this).is(':selected') 
                                    };
                }
            });
        }
    }

    function showPanel(){
        keepOnePanel();
        $('.'+classPanel).slideDown(timeAnim);
        setTimeout(() => { $('.'+classPanel).css('height', 'auto') }, timeAnim );
    }

    function keepOnePanel(){
        i = 0;
        $('.'+classPanel).each(function(){
            if(i)$(this).remove();
            i++;
        })
    }

}

/* end Search widget : panel showing */


















































    //Récupérer le type de la page
    const url = window.location.href
    const urlSearchType = url.search(/\/vn|\/vo|\/vd/i);
    const type = urlSearchType > -1 ? url.substr(urlSearchType+1, 2) : 'vo';

    /* Search Widget */
	let sWidget = new searchWidget();

	$.get('/search/infosbar/'+type, {}, 'JSON')
		.done(
			(response,status,xhr) => { sWidget.done(response,status,xhr) }
		);
    /* end Search Widget */
    

    /* Slider range */
	/*$('.range-container').each(
		function(){
			$(this).searchWidgetRange();
		}
    );*/
    /* end Slider range */

    /* Select filter panel */
    $('.ja-search-widget-filter:not([active=true])').each(
        function(){
            $(this).sWidgetShowPanel();
        }
    );
    /* end Select filter panel */

    /* Show most filter */

    function sWidgetPlusFilter(){
        $('.ja-search-widget-items.plus').each( function(){

            if( $(this).css('display') === 'none' ){
                $(this).css('display', 'flex');
            }
            else{
                $(this).slideUp();
            }
        });
    }

    $('.ja-search-widget-filter-plus').off('click', sWidgetPlusFilter);
    $('.ja-search-widget-filter-plus').on('click', sWidgetPlusFilter);
    /* end Show most filter */


    /* Show results */

    //On enregistre l'état de la fonction de recherche dinamique
    let isSearchBarOn   = false,
        timeout = 0,
        timeIntervalSec = 1,
        interval,
        timesPending    = 10;

        
    function changeIsOnSearch( callback ){
        setTimeout(()=>{ isSearchBarOn = false; ajaxSearchBar();}, timesPending);
    }


    function timeoutCounter(){
        interval = setInterval(() => { 
                timeout++; 
                if(timeout >= timeIntervalSec){
                    closeCounter();
                    resetCounter();
                    ajaxSearchBar();
                } 
            }, 1000);
    }

    function closeCounter(){
        clearInterval(interval);
    }

    function resetCounter(){
        timeout = 0;
    }

    let template = ''; 
    function showResult(results){

        $('#resultMessage').empty();

        if( results.nbResults > 0  ){
            let template = $($('.template')[0]);
            $('#pageResult').empty();

            $.each(results.aVehicles, (id, vh) => {
                let brand = vh.sBrand,
                    name = vh.sName,
                    km = vh.i_veh_kilometre,
                    fuel = vh.sFuel,
                    trans = vh.s_veh_typtxttranstypecd2lbl,
                    body = vh.sBody,
                    color = vh.sCouleurExt,
                    mec = vh.d_veh_date_mec,
                    price = vh.fPrice,
                    link = template.find('.link').attr('href').replace(/\d+$/, id),
                    image = vh.aCVehiculeImageDTO.s_vim_nom+'&width=500&height=500&bCrop=1&FORMAT=2';

                template = template.clone();
                template.find('.brand').html(brand);
                template.find('.model').html(name);
                template.find('.name').text(name);
                template.find('.km').text(km);
                template.find('.fuel').text(fuel);
                template.find('.trans').text(trans);
                template.find('.body').text(body);
                template.find('.color').text(color);
                template.find('.mec').text(mec);
                template.find('.price').text(price);
                template.find('.link').attr('href', link);
                template.find('.image').attr('src', image).attr('alt', name).attr('title', name);

                $('#pageResult').append(template);
                $('#pageResult').trigger('click');
                    
                $('#resultMessage').html( '<div class="col-12 text-center"><h4>'+results.nbResults+' résultats pour votre recherche.</h4></div>' );
               

            });
        }
        else{
            $('#resultMessage').html( '<div class="col-12 text-center"><h4>Aucun résultat pour votre nouvelle recherche.</h4></div>' );
        }
    }

    function ajaxSearchBar(){
        let data = {};

        //On récupére toutes les valeurs
        $('.ja-search-widget').find('input, select').each(function(){
            let name = $(this).attr('name'),
                value = $(this).val();

                if(value != "" && value.length){
                    data[name] = $.trim(value).toLowerCase();
                }                
        });

        $('#resultMessage').html( '<div class="col-12 text-center"><h4><i class="fas fa-spinner fa-spin"></i> Recherche en cours.</h4></div>' );

        $.ajax({
            url : "/search/bar",
            method : "GET",
            dataType : "JSON",
            data : data
        })
        .done( (response, status, xhr) => {
            showResult(response);
            
        })
        .fail( (error) => {
            $('#resultMessage').html( '<div class="col-12 text-center"><h4>Une erreur est survenu merci de bien vouloir réessayer.</h4></div>' );
        })
        .always(() => {
            $('.showDetails').on('click', function(e){
                e.preventDefault();
                $(this).closest('.car-card-preview').trigger('mouseenter');
            });
        });

    }

    function onSearchBarChange(){

        closeCounter();
        resetCounter();
        timeoutCounter();
        
        
        if(!isSearchBarOn){
            
            isSearchBarOn = true;

            changeIsOnSearch();
            //ajaxSearchBar();

        }
        
    };


    //Au changement de value dans la search bar
    $('.ja-search-widget').find('input,select').each(function(){
        
        $( $(this) ).off('change', onSearchBarChange );
        $( $(this) ).on('change', onSearchBarChange );
        
    });
    
    /* end Show results */

    $('.ja-filter-show').on('click', () => {
        $('.ja-filter').toggleClass('d-none');
    })

