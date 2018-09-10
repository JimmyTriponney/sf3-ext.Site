/************************

	<p class="message"></p>
	<form action="#" class="ja-form" method="post">
		<div class="ja-input-group">
			<label class="ja-label">
				<input type="text" label="Nom esthétique" name="corporate" required placeholder="Société" class="ja-input required" />
				<sub class="errors ja-txt-red"></sub>
			</label>
		</div>
	</form>

************************/



/* Add asterisk for required field */
$(function(){

	$('input.required:not([required]), select.required:not([required]), textarea.required:not([required])').attr('required',true);

	$('input[required], textarea[required], select[required]')
		.each(function()
		{
			$(this)
				.parent()
				.append('<span class="asterisk">*</span>');
		}
	);

	$('form').on('submit', function(e)
		{
			e.preventDefault();

			let
				form = $(this),
				dataLabel = {},
				data = form.serializeArray(),
				url = form.attr('action')
			;

			//Add beautiful label for sent to back
			form.find('input,select,textarea').each( (index, el) =>
				{
					if( $(el).attr('label') != undefined )
						dataLabel[ $(el).attr('name').replace(/\[\]/g, "") ] = $(el).attr('label')
				}
			);
			data.push( {'name' : '_label', 'value' : JSON.stringify(dataLabel) } );

			//Disable fields pending ajax response
			form.find('input,select,textarea,button').attr('disabled', true);

			//Re initializa form's errors
			form.find('.errors').html('');
			//Re initializa success message
			form.prev('.message').html('');

			$.post(url, data,'json')
				.then( 
					//Success function
					(json, stat, header) => 
						{	
							//If this test request is sent
							if( stat == 'success')
							{
								//Hide form
								form.addClass('d-none');
								//Enable fields pending ajax response
								form.find('input,select,textarea,button').attr('disabled', false);
							
								if( json.message.length )
									//Show success message
									form.prev('.message').html(json.message);
							}
						},
					//Fail function
					(res, stat, header, d) =>
						{
							//Enable fields pending ajax response
							form.find('input,select,textarea,button').attr('disabled', false);

							let json = res.responseJSON;

							//Show errors under fields
							if( stat == 'error' )
								$.each( json.errors, (type, messages) =>
									$.each( messages, (name, message) =>
										form.find('[name='+name+'] + .errors').append(message+'</br>')
									)
								);
						}
				)
			;
		}
	);
});