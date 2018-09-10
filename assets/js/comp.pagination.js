$_GET = function(param)
{
	var
		url = window.location.href//Recover URL
		getData = url.replace(/^.*\?/, '').split('&'),//Recover get data
		data = {}
    ;
    
    $.each(getData, function(k,v)
	{
		var get = v.split('=');
		data[get[0]] = get[1] !== undefined ? get[1] : '';
	});
    
	if(param)
	{
		if(data[param])
			return data[param];
		else
			return false;
	}
	
	return data;
};


$.fn.jaPagination = function(data = null){

    let
        container       = $(this),//Conteneur de page
        selElement      = '.template',//data && data.selElement ? data.selElement : false,//Element a chunk par page
        elPage          = data && data.elPage ? data.elPage : 12,//Element à afficher par page
        nbRows          = data && data.nbRows ? data.nbRows : 4,
        pageStart       = data && data.pageStart ? data.pageStart : 1,

        classPaginationContainer    = 'pagination-container',
        classPaginationNav          = 'ja-pagination-nav',
        classPaginationBar          = 'ja-pagination',
        classPaginationButton       = 'pagination-button'
    ;

    //Initialisation du plugin à la déclaration
    function init(){
        showPaginationBar(1);//Affichage de la barre de pagination
        showPage(1);//Afficher la page une et masquer les autres éléments
    }






    //Afficher les élement correspondants à la page demandé en index
    function showPage(index){
        let countEl = countElement(),
            countShow = 1;
        if( countEl > 0  && index > 0 && index <= countPage() ){
            let elements = getElements();
            
            for(var i = 0; i < countEl; i++){

                $(elements[i])
                    .removeClass('d-none')
                    .removeClass('d-sm-block')
                    .removeClass('d-lg-block');

                if(i < (elPage*(index-1)) || i >= (elPage*index) ){
                    $(elements[i]).addClass('hide');
                }
                else{
                    $(elements[i]).removeClass('hide');
                    
                    if(countShow > nbRows) $(elements[i]).addClass('d-none');
                    if(countShow > nbRows && countShow < (nbRows * 2 + 1) ) $(elements[i]).addClass('d-sm-block');
                    if(countShow > (nbRows * 2) && countShow < (nbRows * 3 + 1) ) $(elements[i]).addClass('d-lg-block');

                    countShow++;
                }
            }
            
            activeButton(index);
            container.attr('page',index);
        }
    }

    //Activer le bouton en cour
    function activeButton(index){
        $('.'+classPaginationContainer).find('.'+classPaginationButton).removeClass('active');
        $('.'+classPaginationContainer).find('.'+classPaginationButton+'[page='+index+']').addClass('active');
    }







    /*
    
        AFFICHAGE BARRE DE NAVIGATION
    
    */
    //Affichage de la barre de pagination
    function showPaginationBar(page){
        //Créer la barre de pagination
        let paginationTop       = createPagination(page),
            paginationBottom    = createPagination(page),
            nbPage = countPage();

        page = page > 0 ? page : 1; 
        page = page <= nbPage ? page : nbPage;

        if(page > 0 && page <= nbPage){
            //Ajout de celle-ci au DOM
            $('.'+classPaginationContainer).remove();
            //container.before(paginationTop);
            container.after(paginationBottom);

            $('.'+classPaginationButton+'[page="'+page+'"]').addClass('active');
        }
    }

    //Créer la barre de pagination
    function createPagination(page){
        let nbPage = countPage();

        if( nbPage > 0 ){
            let html    = $('<div class="row '+classPaginationContainer+'"><nav class="col-12 '+classPaginationNav+'"><ul class="'+classPaginationBar+'"></ul></nav></div>'),
                i = parseInt(page)-2,
                iMax = parseInt(page)+2;

            iMin = i = i < 1 ? 1 : i;
            iMax = iMax > nbPage ? nbPage : iMax;

            //Nombre de pages nécessaires
            for(i; i <= iMax; i++){
                //Ajout d'un bouton par page
                let btn = createButtonPagination(i);
                if(i < page-1 || i > parseInt(page)+1){
                    btn.addClass('d-none');
                    btn.addClass('d-lg-inline');
                }
                if(i == page){
                    btn.addClass('d-inline-block');
                }
                html.find('.'+classPaginationBar).append(btn);
            }

            if(iMin > 1){
                if(iMin > 2) html.find('.'+classPaginationBar).prepend(createButtonPaginationOther());
                html.find('.'+classPaginationBar).prepend(createButtonPagination(1));
            }
            if(iMax < nbPage + 1){
                if(iMax < nbPage - 1) html.find('.'+classPaginationBar).append(createButtonPaginationOther());
                html.find('.'+classPaginationBar).append(createButtonPagination(nbPage));
            }

            //Ajout du bouton d'accès direct à la page suivante ou précédente
            html.find('.'+classPaginationBar).prepend(createButtonPagination5('start'));
            html.find('.'+classPaginationBar).append(createButtonPagination5('end'));

            //Ajout du bouton d'accès direct à la page une ou de fin
            html.find('.'+classPaginationBar).prepend(createButtonPaginationStartEnd('start'));
            html.find('.'+classPaginationBar).append(createButtonPaginationStartEnd('end'));

            return html;
        }
        return '';
    }

    //Créer le bouton de sélectiond de page
    function createButtonPagination(index){
        let html = $('<li class="'+classPaginationButton+'" page="'+index+'">'+index+'</li>');
        html.on('click', onChangePage);
        return html;
    }

    //Créer le bouton de début et de fin
    function createButtonPaginationStartEnd(position){
        let targetPage = position === 'start' ? 1 : countPage(),
            html = $('<li class="'+classPaginationButton+'" page="'+targetPage+'">'+( position === 'start' ? '|<<' : '>>|' )+'</li>');
        html.on('click', onChangePage);
        return html;
    }

    //Créer le bouton de -5 & +5
    function createButtonPagination5(position){
        let html = $('<li class="'+classPaginationButton+' d-lg-inline d-none" style="'+( position === 'start' ? 'margin-right: 10px;' : 'margin-left: 10px;' )+'" page="'+( position === 'start' ? 'moins' : 'plus' )+'">'+( position === 'start' ? '-5' : '+5' )+'</li>');
        html.on('click', onChangePage5);
        return html;
    }

    //Créer le bouton de "..."
    function createButtonPaginationOther(){
        return $('<li class="'+classPaginationButton+' d-lg-inline d-none">...</li>');
    }









    /*
    
        ACTION DE LA BARRE DE PAGINATION
    
    */
    
    //Afficher une page spécifique
    function onChangePage(){
        if( !$(this).is('.active') ){
            let pageTarget = $(this).attr('page');
            showPage(pageTarget);
            showPaginationBar(pageTarget);
        }
    }

    //Changer d'une page
    function onChangePage5(){
        if( !$(this).is('.active') ){
            let currentPage = container.attr('page'),
                action = $(this).attr('page'),
                pageTarget = action === 'moins' ? parseInt(currentPage)-5 : parseInt(currentPage)+5,
                nbPage = countPage();

            pageTarget = pageTarget > 0 ? pageTarget : 1; 
            pageTarget = pageTarget <= nbPage ? pageTarget : nbPage;
        
            showPage(pageTarget);
            showPaginationBar(pageTarget);
        }
    }











    /*
    
        INFORMATIONS SUR LE CONTENU TOTAL, nombre d'éléments, récuparetion des élements, nombre de page
    
    */
    //Compter le nombre d'éléments
    function countElement(){
        return getElements().length;
    }

    //Récupérer les élements de la page
    function getElements(){
        return container.find(selElement);
    }

    //Compter le nombre de pages nécessaires
    function countPage(){
        return Math.ceil(countElement() / elPage);
    }







    //Lancement du plugin
    init();

};


$('#pageResult').jaPagination();

//Mettre à jour le contenu du container ainsi que le systéme de pagination
function onUpdatePage(){
    let getPage = $_GET('page');
    $('.pagination-container').remove();//On enléve le systéme de pagination précédent
    $('#pageResult').jaPagination({pageStart: getPage});
}

$('#pageResult').on('click', onUpdatePage);