<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;


/**
	@Route(
		"/car/contact",
		name="carContact"
	)
	@Method({"POST"})
*/
class ContactController extends Controller
{

	private $response = [
			'status' => true,
		];

	private $authentification = [ 'Authentification' =>
			[
				'iMode' => 1,
				'sId' => '9ab98b1f1e647c65ebedf670363bc813',
				'sPass' => 'LJ45ZD+/ld9#',
				'sIdClient' => '7d04bbbe5494ae9d2f5a76aa1c00fa2f'
			]
		];
		
		
	/**
		@Route(
			"/try",
			name="Try"
		)
	*/
	public function tryAction(Request $request)
	{
		// If empty request
		if( !$request->isXmlHttpRequest() ) 
			return new Response('cette page est inaccessible.', 404);

		//Param to validate data
		$messMain = 'Une erreur est survenue merci de bien vouloir réessayer, si le problème persist merci de contacter la concession.';
		$messId = 'Nous n\'avons pas réussi à identifier le véhicule que vous souhaitez essayé.';
		$messRequired = 'Le champ {{field}} est obligatoire.';
		$messPhone = 'Le numéro de téléphone "{{value}}" est incorrect.';
		$messMail = 'L\'email "{{value}}" est incorrect.';
		$messLength = 'Le champ {{field}} doit contenir entre {{min}} et {{max}} charactères.';
		$messLengthMin = 'Le champ {{field}} doit contenir au moins {{min}} charactères.';
		$messLengthMax = 'Le champ {{field}} doit contenir plus de {{max}} charactères.';

		$fieldsParam = [
				'_id' => [
					'required' => $messId,
					'isInt' => $messId,
				],
				'name' => [
					'required' => $messRequired,
					'length' => [
							'min' => 2,
							'messageMin' => $messLengthMin
					],
				],
				'firstname' => [
					'required' => $messRequired,
					'length' => [
							'min' => 2,
							'messageMin' => $messLengthMin
					],
				],
				'phone' => [
					'required' => $messRequired,
					'phone' => [
						'message' => $messPhone,
						'type' => 'all', //['all','cell','phone']
					],
				],
				'mail' => [
					'required' => $messRequired,
					'mail' => $messMail,
				],
			];
		
		//Recover Jeannin's validator
		$validator = $this->get('form.validator');
		$validator->setRequest($request);
		$validator->setParam($fieldsParam);

		if( ($errors = $validator->validate()) !== true )
		{	
			$this->response['status'] = false;
			$this->response['errors'] = $errors;
			return new JsonResponse($this->response, 404);
		}

		//Recover car's informations
		$wafy = $this->get('wafy.api');
		$car = $wafy->getVehicleById( $request->request->get('_id') );
		
		//Recover label for Wafy
		$labels = json_decode( $request->request->get('_label'), true);
	
		//Wafy initialization
		$dataForLead = $wafy->initByCar($car, 'generale');//Setting wafy automaticly with one car wafy
		$wafy->addLabel($labels);

		//Completing informations for the lead
		$addData = [
			'Url' => $request->server->get('HTTP_REFERER'),
			'Référence véhicule' => $car['aVehicle']['sReference'],
			'Marque' => $car['aVehicle']['sBrandName'],
			'Model' => $car['aVehicle']['sModel'],
			'mec' => $car['aVehicle']['sMECDate'],
		];
		$wafy->setSLeaCampagneLib("Demande d'essai - site Jeannin Automobiles");
		
		//Add lead data
		$wafy->addRequest($request->request);
		$wafy->addRequest($addData);

		//Push lead in Wafy
		$setLead = $wafy->setLead();

		if(!$setLead)
		{
			$this->response['status'] = false;
			$this->response['errors']['main'] = $messMain;
			return new JsonResponse($this->response, 404);
		}	

		//Add success message
		$this->response['message'] = "Votre demande d'essai a été envoyée au service commercial, elle sera traitée dans les plus bref délai.";
		return new JsonResponse($this->response, 200);
	}
		
	/**
		@Route(
			"/contactcar",
			name="InfoCar"
		)
	*/
	public function infoAction(Request $request)
	{
		// If empty request
		if( !$request->isXmlHttpRequest() ) 
			return new Response('cette page est inaccessible.', 404);

		//Param to validate data
		$messMain = 'Une erreur est survenue merci de bien vouloir réessayer, si le problème persist merci de contacter la concession.';
		$messId = 'Nous n\'avons pas réussi à identifier le véhicule que vous souhaitez essayé.';
		$messRequired = 'Le champ {{field}} est obligatoire.';
		$messPhone = 'Le numéro de téléphone "{{value}}" est incorrect.';
		$messMail = 'L\'email "{{value}}" est incorrect.';
		$messLength = 'Le champ {{field}} doit contenir entre {{min}} et {{max}} charactères.';
		$messLengthMin = 'Le champ {{field}} doit contenir au moins {{min}} charactères.';
		$messLengthMax = 'Le champ {{field}} doit contenir plus de {{max}} charactères.';

		$fieldsParam = [
				'_id' => [
					'required' => $messId,
					'isInt' => $messId,
				],
				'name' => [
					'required' => $messRequired,
					'length' => [
							'min' => 2,
							'messageMin' => $messLengthMin
					],
				],
				'firstname' => [
					'required' => $messRequired,
					'length' => [
							'min' => 2,
							'messageMin' => $messLengthMin
					],
				],
				'phone' => [
					'required' => $messRequired,
					'phone' => [
						'message' => $messPhone,
						'type' => 'all', //['all','cell','phone']
					],
				],
				'mail' => [
					'required' => $messRequired,
					'mail' => $messMail,
				],
			];
		
		//Recover Jeannin's validator
		$validator = $this->get('form.validator');
		$validator->setRequest($request);
		$validator->setParam($fieldsParam);

		if( ($errors = $validator->validate()) !== true )
		{	
			$this->response['status'] = false;
			$this->response['errors'] = $errors;
			return new JsonResponse($this->response, 404);
		}

		//Recover car's informations
		$wafy = $this->get('wafy.api');
		$car = $wafy->getVehicleById( $request->request->get('_id') );
		
		//Recover label for Wafy
		$labels = json_decode( $request->request->get('_label'), true);
	
		//Wafy initialization
		$dataForLead = $wafy->initByCar($car, 'generale');//Setting wafy automaticly with one car wafy
		$wafy->addLabel($labels);

		//Completing informations for the lead
		$addData = [
			'Url' => $request->server->get('HTTP_REFERER'),
			'Référence véhicule' => $car['aVehicle']['sReference'],
			'Marque' => $car['aVehicle']['sBrandName'],
			'Model' => $car['aVehicle']['sModel'],
			'mec' => $car['aVehicle']['sMECDate'],
		];
		$wafy->setSLeaCampagneLib("Demande d'informations - site Jeannin Automobiles");
		
		//Add lead data
		$wafy->addRequest($request->request);
		$wafy->addRequest($addData);

		//Push lead in Wafy
		$setLead = $wafy->setLead();

		if(!$setLead)
		{
			$this->response['status'] = false;
			$this->response['errors']['main'] = $messMain;
			return new JsonResponse($this->response, 404);
		}	

		//Add success message
		$this->response['message'] = "Votre demande d'information a été envoyée vous allez être recontacté dans les plus bref délai.";
		return new JsonResponse($this->response, 200);
	}
	
	/*
		Show debug
	*/
	private function debug($var)
	{
		echo '<pre>';
		print_r($var);
		echo '</pre>';
	}
}

