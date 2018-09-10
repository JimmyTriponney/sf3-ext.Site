<?php
namespace App\Controller;

//Controller class
use Symfony\Component\HttpFoundation\Response;
//Router
use Symfony\Component\Routing\Annotation\Route;
//Response
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
//Request
use Symfony\Component\HttpFoundation\Request;
//Generate URL
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
//Wafy
use App\Entity\JAWafy;
//SearchController
use App\Controller\SearchController;

//Html2PDF
//use Spipu\Html2Pdf\Html2Pdf;
//Knp PDF and image convert
//use Knp\Bundle\SnappyBundle\Snappy\Response\PdfResponse;

/**
	@Route(
		"/car",
		name="car"
	)
*/
class CarController extends Controller
{
	
	private $request;
	private $authentification = [ 'Authentification' =>
			[
				'iMode' => 1,
				'sId' => '9ab98b1f1e647c65ebedf670363bc813',
				'sPass' => 'LJ45ZD+/ld9#',
				'sIdClient' => '7d04bbbe5494ae9d2f5a76aa1c00fa2f'
			]
		];
		
	public function __construct(){
		$this->request = Request::createFromGlobals();
	}
	
		/**
		@Route(
			"/{type}/file/{id}",
			name = "File",
			requirements = {"type" = "\D+", "id" = "\d+"},
			defaults = {"id" = 0}
		)
	*/
	public function carFile($id,$type)
	{
		if(!$id || !in_array(strtolower($type),['vo','vn']))
			throw $this->createNotFoundException('Le véhicule que vous cherchez est introuvable.');
		
		$Wafy = new JAWafy();
		$carDetails = $Wafy->oneCar($id);
			
		if( isset($carDetails['error']) )
			throw $this->createNotFoundException('Le véhicule que vous cherchez est introuvable.');
		
		
		return $this->render('carFile.html.twig', ['vh' => $carDetails['aVehicle']]);
	}


	/**
		@Route(
			"/",
			name="homeList"
		)
	*/
	public function homeList()
	{
		$Wafy = new JAWafy();
		//$listVehicle = $Wafy->allVehicles();
		$listNewVehicle = $Wafy->allVehicles('vn',12);
		$listUsedVehicle = $Wafy->allVehicles('vo',12);
		$listDirectionVehicle = $Wafy->allVehicles('vd',12);

		return $this->render('carListPreview.html.twig',
			[
				'nc' => $listNewVehicle['aVehicles'],
				'uc' => $listUsedVehicle['aVehicles'],
				'dc' => $listDirectionVehicle['aVehicles'],
				'nbVh'=>($listDirectionVehicle['iNbResults']+$listNewVehicle['iNbResults']+$listUsedVehicle['iNbResults']),
				'typeCard'=>'carList',
				'nbRows' => 3,
			]);
	}
	
	/**
		@Route(
			"/{type}/{page}/{nb}",
			name = "listBy",
			requirements = {"type" = "\D{2}", "page" = "\d+", "nb" = "\d+"},
			defaults = {"page" = 1, "nb" = 10}
		)
	*/
	public function listBy($type /*,$page, $nb*/)
	{
		if( !in_array(strtolower($type), ['vn','vo','vd']) /*|| $page == 0*/ )
			throw $this->createNotFoundException('La page que vous demandez est introuvable.');
		
		session_start();

		$Wafy = new JAWafy();
		 
		$listVehicle = $Wafy->allVehicles($type /*, $page ?? null, $nb ?? null*/);
		$allStockDetails = $Wafy->allStockDetails($type);
		
		/*if( $page > $listVehicle['iNbResults']/$nb+1 )
			throw $this->createNotFoundException('La page que vous demandez est introuvable.');*/


		return $this->render('carList.html.twig',
			[
				'listVh'=>$listVehicle['aVehicles'], 
				'nbVh'=>$listVehicle['iNbResults'],
				'searchBar' => json_encode($allStockDetails),
				'typeCard'=>'carList',
				'valueSearch' => isset($_SESSION['search']) ? $_SESSION['search'] : null
			]);
	}

	/**
	 	@Route(
	  			"/model/{brand}/{model}",
	  			name = "listByModel",
				requirements = { "brand" = "\D+", "model" = "\D+" }
			)
	 */
	public function listByModel($brand, $model){

		if( !isset($brand) || empty($brand)	|| !isset($model) || empty($model) ) throw $this->createNotFoundException('La page que vous demandez est introuvable.');

		//Nombre de résultats maximum
		$limit = 6;
		//Récupérer l'entité wafy
		$Wafy = new JAWafy();
		//Récupérer les marques et models en stock
		$stockInfo = $Wafy->allStockDetails(0);//Stock VN
		//Convertir la marque en id brand natcode
		$idBrand = $this->convertBrandToId($brand, $stockInfo['brand']);
		//Récuparation de tous les modèles comprennant le nom demandé dans l'url
		$listModelSearch = $this->findAllNameModelByOne($model, $stockInfo['brandModel'][$idBrand]);
		$listModelSearch = empty( $listModelSearch ) ? [] : $listModelSearch;
		//Tableau de récuparation de véhicules
		$vehiclesTab = [ 'vn' => [], 'vo' => [], 'vd' => [] ];
		$nbCar = 0;

		//Si l'id n'existe pas pour cette marque OU si aucun modèle n'est trouvé avec ce nom
		if( $idBrand === false ) throw $this->createNotFoundException('La marque est introuvable.');
		
		//Récupération des modèle en stock VO VN et VD
		//On boucle par nom de model
		foreach( $listModelSearch as $modelOne ){

			//Data a envoyé à la fonction pour rechercher les véhicules
			$data = [
				'i_veh_typeconfiguration' => 0,
				'i_veh_maknatcode' => $idBrand,
				's_veh_modname2' => $modelOne,
				'iPerPage' => $limit,
			];

			//Appel de la fonction et récupération des valeurs de retours
			$data['i_veh_typeconfiguration'] = 0;
			$requestVN = $Wafy->allVehiclesForSearch($data);
			$data['i_veh_typeconfiguration'] = 1;
			$requestVO = $Wafy->allVehiclesForSearch($data);
			$data['i_veh_typeconfiguration'] = 2;
			$requestVD = $Wafy->allVehiclesForSearch($data);

			//Merge des données existants avec les nouvelles par stock
			$vn = array_merge($vehiclesTab['vn'], $requestVN['results']);
			$vo = array_merge($vehiclesTab['vo'], $requestVO['results']);
			$vd = array_merge($vehiclesTab['vd'], $requestVD['results']);

			//Enregistrement du resultat dédoublonné avec l'ancien pour le retour
			$vehiclesTab['vn'] = $vn;
			$vehiclesTab['vo'] = $vo;
			$vehiclesTab['vd'] = $vd;

			//Compte du nombre total de résultat
			$nbCar += $requestVN['nbResults'] + $requestVO['nbResults'] + $requestVD['nbResults'];
		}

		//Si aucun véhicule n'a était trouvé
		//if( !$nbCar ) throw $this->createNotFoundException('Le véhicule recherché est actuellement introuvable.');

		return $this->render('carListPreview.html.twig',
			[
				'nc' => array_slice($vehiclesTab['vn'], 0, $limit),
				'uc' => array_slice($vehiclesTab['vo'], 0, $limit),
				'dc' => array_slice($vehiclesTab['vd'], 0, $limit),
				'nbVh'=>$nbCar,
				'typeCard'=>'carList',
				'model' => strtoupper($model),
				'nbRows' => 2,
			]);
	}

	private function convertBrandToId($brand, $brandList = false){
		$brandInfo = $brandList ? $brandList : $Wafy->allStockDetails(1)['brand'];

		foreach( $brandInfo as $id => $name ){
			if( trim(strtolower($brand)) == trim(strtolower($name)) ){
				return $id;
			}
		}

		return false;
	}

	private function findAllNameModelByOne($modelSearch, $modelList){
		$tabReturn = [];

		foreach($modelList as $keyModel => $model){
			if( \preg_match('/'.$modelSearch.'/i', $model) ){
				$tabReturn[] = $keyModel;
			}
		}

		if( count($tabReturn) < 1 ) return false;
		return $tabReturn;
	}
	
	/**
		@Route(
			"/{type}/details/{id}",
			name = "carDetails",
			requirements = {"type" = "\D+", "id" = "\d+"},
			defaults = {"id" = 0}
		)
	*/
	public function carDetails($id,$type)
	{
		if(!$id || !in_array(strtolower($type),['vo','vn','vd']))
			throw $this->createNotFoundException('Le véhicule que vous cherchez est introuvable.');
			
		$Wafy = new JAWafy();
		$carDetails = $Wafy->oneCar($id);
		
		if( isset($carDetails['error']) )
			throw $this->createNotFoundException('Le véhicule que vous cherchez est introuvable.');
		
		return $this->render('carDetails.html.twig', ['vh' => $carDetails['aVehicle']]);
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

