/* Modal */

$(function(){

	$('*[modal]')
		.each(function(){
			let
				modal = $(this).attr('modal')
			;

			$(this)
				.on('click', function(e){ e.preventDefault(); $(modal).jaModal('show'); });
		});

});

$.fn.jaModal = function(action,speed)
{
	const modal = $(this);
	let
		s = speed != undefined && speed.isNumeric() ? speed : 500
	;

	modal
		.find('.close')
		.on('click', function(e){
			e.preventDefault();
			closeModal(modal, s);
		})
	;

	modal
		.on('click', function(e)
		{
			if( $(e.target).is('[class$=-modal]') )
			{
				e.preventDefault();
				closeModal(modal, s);
			}
		})
	;

	if(action.toLowerCase() == 'show')
	{
		openModal(modal, s);
	}

	if(action.toLowerCase() == 'hide')
	{
		closeModal(modal, s)
	}
}


function openModal(modal, speed)
{
	modal
		.children()
		.css({
			opacity : 0,
			top : '-1000px'
		})
	;

	modal
		.css({
			opacity : 0,
			display : 'flex'
		})
	;

	modal
		.animate({
			opacity : 1
		}, 250)
	;

	modal
		.children()
		.animate({
			opacity : 1,
			top : '30px'
		},speed)
		;

	modal.find('form').removeClass('d-none');
	modal.find('.message').html('');

	
}

function closeModal(modal, speed)
{
	modal
		.children()
		.animate({
			opacity : 0,
			top : '-1000px'
		},speed,
		function(){
			modal
				.animate({
					opacity : 0
				}, 250, function(){
					modal
						.css({
							display : 'none'
						})
					;
				})
			;
		})
	;
}