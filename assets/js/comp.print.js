/********************
  
  Example :

  <div id="printContainer" class="print">
    /...
  </div>
  
 ***********************/

 $(function(){

  let
    printSec = '.print-section',
    url = $(printSec).attr('srcfile')
  ;

  $.get(url)
    .then( 
      //Succes
      html => $(printSec).html(html),
      //Fail
      (res,status,message) => {
        $(printSec).html( 
          '<h1>'+message+'</h1>'+
          'Nous rencontrons actuellement des difficultés pour générer la fiche demandée, merci de bien vouloir réessayer plus tard et de contacter la concession en lui indiquant l\'erreur rencontrée.'
        )
      }
    );

 });