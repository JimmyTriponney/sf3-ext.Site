
const $ = require('jquery');

require('popper.js');
require('bootstrap');
require('@fortawesome/fontawesome');




function getXDomainRequest() {
	var xdr = null;
	
	if (window.XDomainRequest) {
		xdr = new XDomainRequest(); 
	} else if (window.XMLHttpRequest) {
		xdr = new XMLHttpRequest(); 
	} else {
		alert("Votre navigateur ne gère pas l'AJAX cross-domain !");
	}
	
	return xdr;	
}


