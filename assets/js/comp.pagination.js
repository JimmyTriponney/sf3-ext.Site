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
        elPageInit      = data && data.elPage ? data.elPage : 12,//Element à afficher par page en desktop
        nbRows          = data && data.nbRows ? data.nbRows : 4,
        pageStart       = data && data.pageStart ? data.pageStart : 1,

        classPaginationContainer    = 'pagination-container',
        classPaginationNav          = 'ja-pagination-nav',
        classPaginationBar          = 'ja-pagination',
        classPaginationButton       = 'pagination-button',
        elPage = 0
    ;

    //Initialisation du plugin à la déclaration
    function init(){
        elPage = getElPage();
        showPaginationBar(1);//Affichage de la barre de pagination
        showPage(1);//Afficher la page une et masquer les autres éléments
    }

    function getElPage(){
        docWidth = $(document).width();

        //Calcul du nombre d'éléments par page en fonction de la taille d'affichage
        if( 0 < docWidth && docWidth < 768 ) elPage = elPageInit / 3;
        else if( 767 < docWidth && docWidth < 1200 ) elPage = (elPageInit / 3) * 2;
        else elPage = elPageInit;

        return elPage;
    }

    //Afficher les élement correspondants à la page demandé en index
    function showPage(index){
        let countEl = countElement(),
            countShow = 1,
            elPage = getElPage();

        //Je vérifie qu'il y ai plus de 0 élément, et que la page à afficher soit entre 1 et le nombre de page max compris
        if( countEl > 0  && index > 0 && index <= countPage() ){
            //Récupération de tous les éléments
            let elements = getElements();

            //Itération sur tous les éléments
            for( let i = 0; i < countEl; i++ ) {

                //Retrait des class css mise en place par cette fonction précédement
                $(elements[i])
                    .removeClass('d-none')
                    .removeClass('d-md-block')
                    .removeClass('d-lg-block');

                //Affichage des éléments ou masquage
                if(i < (elPage*(index-1)) || i >= (elPage*index) ){
                    $(elements[i]).addClass('hide');
                }
                else{
                    $(elements[i]).removeClass('hide');
                
                    //Ajout de class css afin de masquer certains éléments si la largueur de la page change
                    //Les éléments qui vont jusqu'au mobile ne change pas
                    if( countShow > (elPageInit / 3) && countShow <= ((elPageInit / 3) * 2) ) $(elements[i]).addClass('d-none d-md-block');//Les élément de SM a LG
                    else if( countShow > ((elPageInit / 3) * 2) ) $(elements[i]).addClass('d-none d-lg-block');//Les éléments à partir de LG                    

                    countShow++;
                }

            }
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
            if(iMax < nbPage ){
                if(iMax < nbPage - 1) html.find('.'+classPaginationBar).append(createButtonPaginationOther());
                html.find('.'+classPaginationBar).append(createButtonPagination(nbPage));
            }

            //Ajout du bouton d'accès direct à la page suivante ou précédente
            html.find('.'+classPaginationBar).prepend(createButtonPagination1('start'));
            html.find('.'+classPaginationBar).append(createButtonPagination1('end'));

            //Ajout du bouton d'accès direct à la 5éme page suivante ou précédente
            html.find('.'+classPaginationBar).prepend(createButtonPagination5('start'));
            html.find('.'+classPaginationBar).append(createButtonPagination5('end'));

            //Ajout du bouton d'accès direct à la page une ou de fin
            if( page > 1 ) html.find('.'+classPaginationBar).prepend(createButtonPaginationStartEnd('start'));
            if( page < nbPage ) html.find('.'+classPaginationBar).append(createButtonPaginationStartEnd('end'));

            return html;
        }
        return '';
    }

    //Créer le bouton de sélectiond de page
    function createButtonPagination(index){
        let html = $('<li class="'+classPaginationButton+' d-none d-sm-inline" page="'+index+'">'+index+'</li>');
        html.on('click', onChangePage);
        return html;
    }

    //Créer le bouton de début et de fin
    function createButtonPaginationStartEnd(position){
        let targetPage = position === 'start' ? 1 : countPage(),
            html = $('<li class="'+classPaginationButton+' d-none d-sm-inline" page="'+targetPage+'">'+( position === 'start' ? '|<<' : '>>|' )+'</li>');
        html.on('click', onChangePage);
        return html;
    }
    
    //Créer le bouton -1 & +1
    function createButtonPagination1(position){
        let html = $('<li class="'+classPaginationButton+' d-sm-none d-inline" style="'+( position === 'start' ? 'margin-right: 10px;' : 'margin-left: 10px;' )+'" page="'+( position === 'start' ? 'moins' : 'plus' )+'">'+( position === 'start' ? '|<' : '>|' )+'</li>');
        html.on('click', onChangePage1);
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

    //Changer de 5 pages
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

    //Changer d'une page
    function onChangePage1(){
        if( !$(this).is('.active') ){
            let currentPage = container.attr('page'),
                action = $(this).attr('page'),
                pageTarget = action === 'moins' ? parseInt(currentPage)-1 : parseInt(currentPage)+1,
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