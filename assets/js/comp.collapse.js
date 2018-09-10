

/**************************
	Example :

	<div class="ja-tab-container">
		<ul class="ja-tab-nav">
			<li class="ja-tab-item active" data-target="fiche technique">TEXT</li>
			<li class="ja-tab-item" data-target="equipements">TEXT</li>
			<li class="ja-tab-item" data-target="informations">TEXT</li>
		</ul>
		<div class="ja-tab-content">
			<div class="ja-tab-panel active" data-target="fiche technique">TEXT</div>
			<div class="ja-tab-panel" data-target="equipements">TEXT</div>
			<div class="ja-tab-panel" data-target="informations">TEXT</div>
		</div>
	</div>

**************************/


/* Variables */
var
	timeTransition = 500,
	collapseContainer = '[class*="tab-container"]',
	collapseItem = '[class*="tab-item"]',
	collapsePanel = '[class*="tab-panel"]'
;

function collapseClic()
{

	var
		$this = $(this),
		currentItem = $this.parent().find('.active'),
		currentPanel = $this.closest(collapseContainer).find(collapsePanel+'.active'),
		target = $this.attr('data-target'),
		targetPanel = $this.closest(collapseContainer).find(collapsePanel+'[data-target="'+target+'"]')
	;

	if($this.is('.active'))
		return false;

	//Remove all class active on items
	currentItem
		.removeClass('active');
	//Add class active on this item
	$this
		.addClass('active');
	//Animate panels
	currentPanel
		.animate(
			{
				'opacity' : 0
			}, 
			timeTransition,
			function()
			{
				$(this)
					.css('display','none')
					.removeClass('active');
				targetPanel
					.css('display','block')
					.animate(
						{
							'opacity' : 1
						},
						timeTransition,
						function()
						{
							$(this).addClass('active');
						}
					);
			}
		);	
}

$(function(){

	$(collapseItem)
		.each( function(){ 
			$(this).on('click',collapseClic);
		} );

});


