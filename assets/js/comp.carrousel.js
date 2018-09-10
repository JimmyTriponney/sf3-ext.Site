/* Carrousel */

/************************

	Example :

	<div class="ja-carrousel-container">
		<div class="ja-carrousel-source">
			<img src="#" alt="#" title="#" class="ja-carrousel-media"/>
			<img src="#" alt="#" title="#" class="ja-carrousel-media"/>
			<img src="#" alt="#" title="#" class="ja-carrousel-media"/>
			...
		</div>
	</div>

**********************/

var
	carrouselContainer = '*[class$="-carrousel-container"]'
;


const Carrousel = function(node, param = null)
{
	this.param = param;
	var htmlOrigin;
	this.node = node;
	this.mediaContainer = '.'+$(node.find('img').parent()[0]).attr('class');
	this.media = {};
	var currentOrder = 0;

	/* Action fullscreen */
	this.fullscreen = function()
	{
		let
			bg = $('<div class="carrousel-full-bg">'+
						'<div class="ja-row">'+
							'<div class="ja-col-12 ja-txt-white ja-txt-right ja-pt-1">'+
								'<i class="fas fa-times carrousel-close"></i>'+
							'</div>'+
						'</div>'+
					'</div>'),
			carrousel = $(this.htmlOrigin)
		;

		$('body').prepend(bg);

		bg.css({
			opacity : 0,
			display : 'block',
			height : '100%',
			paddingBottom : '50px'
		});
		bg.animate({opacity : 1}, 250);

		//Duplicate carrousel in fullscreen
		carrousel.css({ 
			width : '100%',
			height : '100%'
		});
		$('.carrousel-full-bg').append( carrousel );
		
		console.log( html );
		//console.log( this.htmlOrigin );
		console.log( $(carrousel.find('img').parent()[0]).attr('class') );

		//new Carrousel( this.htmlOrigin, { resize : false, fullscreen : false });
		
	}

	/* Add fullscreen */
	this.addFullscreen = function()
	{
		let
			html = $('<div class="carrousel-fullscreen">'+
						'<i class="fas fa-expand ja-txt-white"></i>'+					
					'</div>')
		;

		html.on('click', this.fullscreen);

		node.append(html);
	}

	/* Create html of side navigation */
	// @Param side String => left | right
	this.sideNav = function(side)
	{
		let html = $(
			'<div class="carrousel-nav-'+side+'" role="'+side+'">'+(side == 'left' ? '<' : '>')+'</div>'
			);

		return html;
	}


	this.addBottomNav = function()
	{
		let navContainer = $('<div class="carrousel-nav-container"></div>'),
			navSlide = $('<div class="carrousel-nav-bloc"></div>');

		$.each(this.media, function(k,v){
				let html = $('<div class="carrousel-nav-item" data-order="'+k+'"><img src="'+v.link+'" alt="'+v.alt+'" title="'+v.title+'"/></div>');
				navSlide.append(html);
			})
		;
		
		navContainer.append(navSlide);
		navContainer.append(this.sideNav('left'));
		navContainer.append(this.sideNav('right'));

		this.node
			.closest(this.node)
			.append(navContainer)
		;

		this.actionSideNavNav();
		this.actionItem();
	}

	/* Create carrousel nav */
	// @Param media Object => { 0 : {link : 'url', alt : 'alt', title : 'title'} }
	this.recoverMedia = function(media)
	{
		let i = 0, tmpMedia = {};

		this.node
			.find('img')//carrouselMedia)
			.each(function(){
				tmpMedia[i] = 
					{
						link : $(this).attr('src'),
						alt : $(this).attr('alt'),
						title : $(this).attr('title'),
						html : $(this).parent()
					}
				$(this).parent().attr('data-order', i);

				i++;
			})
		;

		this.media = tmpMedia;
	}


	this.wrapMedia = function()
	{
		this.node
			.find('img')//carrouselMedia)
			.wrap( '<div class="carrousel-media-container"></div>' );
	}

	this.resizeMedia = function()
	{
		node
			.find('*[class$="carrousel-source"]')
			.find('img')//carrouselMedia)
			.each(function(){

				let
					$this = $(this),
					img = new Image(),
					parent = $this.parent(),
					pWidth = parent.width(),
					pHeight = parent.height()
				;

				img.src = $this.prop('src');

				img.onload = function()
				{
					let
						width = img.width,
						height = img.height
						wRatio = pWidth/width,
						hRatio = pHeight/height,
						newWidth = wRatio >= hRatio ? '100%' : width*hRatio+'px',
						newHeight = hRatio >= wRatio ? '100%' : height*wRatio+'px'
					;

					$this
						.css({
							width : newWidth,
							height : newHeight
						});
				}

			});

	}

	this.moveRight = function()
	{		
		let
			current = node.find('.carrousel-media-container').first(),
			next = node.find('.carrousel-media-container:eq(1)')
		;

		current.animate({ left : '-100%' }, 700, function(){ $(this).css('left', '100%') });
		next.animate({ left : '0' }, 700);

		currentOrder = next.attr('data-order');
		node
			.trigger('carrousel.change',{next : next});

		node
			.find('.carrousel-media-container')
			.parent()
			.append(current)
		;
		
	}

	this.moveLeft = function()
	{
		let
			current = node.find('.carrousel-media-container').first(),
			next = node.find('.carrousel-media-container').last()
		;

		current.animate({ left : '100%' }, 700);
		next.css('left', '-100%');
		next.animate({ left : '0' }, 700);

		currentOrder = next.attr('data-order');
		node
			.trigger('carrousel.change',{next : next});
		

		node
			.find('.carrousel-media-container')
			.parent()
			.prepend(next)
		;
	}

	this.navMoveRight = function()
	{
		node
			.find('.carrousel-nav-container .carrousel-nav-bloc')
			.stop()
		;

		let
			pWidth = node.find('.carrousel-nav-container').width(),
			sWidth = node.find('.carrousel-nav-container .carrousel-nav-bloc').width(),
			posLeft = parseInt(node.find('.carrousel-nav-container .carrousel-nav-bloc').css('left')),
			wCount = 0
		;

		node
			.find('.carrousel-nav-container .carrousel-nav-bloc')
			.stop()
		;

		node
			.find('.carrousel-nav-container .carrousel-nav-bloc .carrousel-nav-item')
			.each(function(){
				let
					width = $(this).width()
				;

				if( posLeft+wCount+width <= pWidth && posLeft+wCount+width <= sWidth)
				{
					wCount += width;
				}

			});

		node
			.find('.carrousel-nav-container .carrousel-nav-bloc')
			.animate({left : -wCount+'px'},1000)
		;
	}

	this.navMoveLeft = function()
	{
		node
			.find('.carrousel-nav-container .carrousel-nav-bloc')
			.stop()
		;

		let
			pWidth = node.find('.carrousel-nav-container').width(),
			sWidth = node.find('.carrousel-nav-container .carrousel-nav-bloc').width(),
			posLeft = parseInt(node.find('.carrousel-nav-container .carrousel-nav-bloc').css('left')),
			wCount = 0
		;

		node
			.find('.carrousel-nav-container .carrousel-nav-bloc')
			.stop()
		;

		if(posLeft < 0 && Math.abs(posLeft) > pWidth)
			wCount = posLeft+pWidth;
		

		node
			.find('.carrousel-nav-container .carrousel-nav-bloc')
			.animate({left : wCount+'px'},1000)
		;
	}

	/* Add side navigation */
	this.addSideNav = function()
	{
		//Add left nav
		this.node
			.append(this.sideNav('left'));
		//Add right nav
		this.node
			.append(this.sideNav('right'));

		//Add action
		this.actionSideNav();
	}

	/* Action for side nav */
	this.actionSideNav = function()
	{
		this.node
			.find('.carrousel-nav-left')
			.first()
			.on('click', this.moveLeft)
		;
		this.node
			.find('.carrousel-nav-right')
			.first()
			.on('click', this.moveRight)
		;
	}
	this.actionSideNavNav = function()
	{
		this.node
			.find('.carrousel-nav-container [class$="nav-left"]')
			.on('click', this.navMoveLeft)
		;
		this.node
			.find('.carrousel-nav-container [class$="nav-right"]')
			.on('click', this.navMoveRight)
		;
	}

	this.actionItem = function()
	{
		this.node
			.find('.carrousel-nav-container .carrousel-nav-item')
			.each(function(){
				$(this).on('click', function(){
					let
						dataOrder = $(this).attr('data-order'),
						find = false
					;

					node
						.find('.carrousel-media-container')
						.each(function(){
							
							let
								order = $(this).attr('data-order')
							;

							if (order != dataOrder && !find )
							{
								$(this).css('left', '100%');

								node
									.find('.carrousel-media-container')
									.parent()
									.append($(this))
								;
							}
							else if (order == dataOrder)
							{
								let $this = $(this);

								$(this)
									.attr('style', '')
									.css({
										left : 0,
										top : '100%',
										transform : 'scale(0.5,0.5)'
									})
									.animate({
										top : 0
									},
									{
										step : function(a,b)
												{
													$(this).css('transition','transform 1s'); 
													$(this).css('transform','scale(1,1)'); 
												}
									}, 1000);
								;
								find = true;								
							}

							currentOrder = dataOrder;

						})
					;
				});
			})
		;
	}

	this.updateBottomNav = function()
	{
		let
			countWidth = 0,
			$this = $(this),
			sWidth = $this.find('.carrousel-nav-container .carrousel-nav-bloc').width(),
			pWidth = $this.find('.carrousel-nav-container').width(),
			posLeft = parseInt($this.parent().css('left')),
			find = false,
			order = currentOrder
		;


		node
			.find('.carrousel-nav-container .carrousel-nav-bloc .carrousel-nav-item')
			.each(function(){
				let
					$this = $(this),
					orderNext = $this.attr('data-order'),
					width = $this.width()
				;

				if(!find && order != orderNext)
				{
					countWidth += width;
				}
				else if(!find && order == orderNext)
				{
					countWidth += width;
					find = true;
				}
			})
		;

		let newLeft = (pWidth/2)-countWidth;
		
		if(newLeft > 0)
		{
			newLeft = 0;
		}
		else if( Math.abs(newLeft)+pWidth > sWidth )
		{
			newLeft = pWidth-sWidth;
		}


		$this
			.find('.carrousel-nav-container .carrousel-nav-bloc')
			.animate({left : newLeft+'px'},500)
		;
		
	}

	this.init = function()
	{
		$(window)
			.on('resize', this.resizeMedia);

		this.node
			.on('carrousel.change', this.updateBottomNav)
		;
	}

	this.recoverCarrousel = function()
	{
		this.htmlOrigin = node.parent().html();
	}

	this.recoverCarrousel();

	this.wrapMedia();
	if( this.param === null || this.param.resize !== false ) this.resizeMedia();

	this.recoverMedia();

	this.addSideNav();
	this.addBottomNav();
	//if( this.param === null || this.param.fullscreen !== false ) this.addFullscreen();

	this.init();
	console.log('test');
};


$(function(){

	$(carrouselContainer)
		.each(function(){
			var
				carrousel = new Carrousel($(this));
			;
		});

});