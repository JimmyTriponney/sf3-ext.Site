<?php

namespace App\Controller;

//Controller class
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
//Router
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
//Response
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
//Generate URL
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
//Request
use Symfony\Component\HttpFoundation\Request;
//Wafy
use App\Entity\JAWafy;

/**
 * @Route(
 *      "/search",
 *      name = "search"
 * )
 */
class SearchController extends Controller
{
    private $wafy = null;

    public function __construct(){
        $this->wafy = new JAWafy();
    }

    /**
     * @Route("/infosbar/{type}", 
     *          name="InfosBar",
	 *		requirements = {"type" = "\D{2}"},
	 *		defaults = {"type" = "vo"})
     */
    public function searchInfosBar($type)
    {
        if( !in_array(strtolower($type), ['vn','vo','vd']))
			throw $this->createNotFoundException('La page que vous demandez est introuvable.');
		
		$Wafy = $this->wafy;//new JAWafy();
         
        $allStockDetails = $Wafy->allStockDetails($type);
        
        return new JsonResponse( $allStockDetails );
    }

    /**
     * @Route("/bar",
     *          name="Bar")
     * @Method({"GET"})
     */
    public function searchBar(Request $request){

        $dataGet = $request->query->all();
        $dataWafy = ['i_veh_destination' => 1];
        $Wafy = $this->wafy;//new JAWafy();
        $res = [ 'aVehicles' => [], 'nbResults' => 0, 'nbSearch' => 0, 'iRequest' => $dataGet];

        
		session_start();
		$_SESSION['search'] = $dataGet;

        //Ici les champs à mettre dans l'appel API en recherche
        $valueForCheck = [
                //Stock
                'stock' => 'i_veh_typeconfiguration',
                //Années
                'yearMin' => 's_veh_annee_min',
                'yearMax' => 's_veh_annee_max',
                //Prix
                'priceMin' => 'f_veh_prhnp1_min',
                'priceMax' => 'f_veh_prhnp1_max',
                //Kilométrage
                'kmMin' => 'i_veh_kilometre_min',
                'kmMax' => 'i_veh_kilometre_max',
                //Puissance
                'chMin' => 'f_veh_typHP_min',
                'chMax' => 'f_veh_typHP_max',
                //Limite
                'limit' => 'iPerPage',
            ];
        
        //Vérification de l'existance des champs en réception et ajout des valeurs à l'appel API
        foreach( $valueForCheck as $name => $trad){
            if( isset($dataGet[$name]) && !empty($dataGet[$name]) ){
                $dataWafy[$trad] = $dataGet[$name];
                unset( $dataGet[$name] );
            }
        }
        $this->debug( $dataGet );
        $this->debug( $dataWafy );
        //Récupération des véhicule correspondant à la première série de filtres
        $allVehicles = $Wafy->allVehiclesForSearch($dataWafy);

        //Filtrage des valeurs
        //Itération par véhicule reçu
        foreach( $allVehicles['results'] as $idVh => $infosVh ){
            $isValidFilter = count($dataGet) ? false : true;
            $isWithImg = true;

            if(\preg_match('/id=9fa31f2b874d78fb76d70074c960e47f7e4927dcb716de3747c9f57cf2516a8ebe6ff7695cffaada4ed3adc16a0ddfaa_2$/', $infosVh['aCVehiculeImageDTO']['s_vim_nom']))
                continue;

            //Format date
            $infosVh['d_veh_date_mec'] = (new \DateTime($infosVh['d_veh_date_mec']))->format('d/m/Y');
            //Format price
            $infosVh['fPrice'] = number_format($infosVh['fPrice'], 0, '.', ' ');
            //Format km
            $infosVh['i_veh_kilometre'] = number_format($infosVh['i_veh_kilometre'], 0, '.', ' ');

            //Vérification du véhicule par filtre
            foreach( $dataGet as $nameFilter => $valueFilter ){
                
                $isValidFilter = false;
                $translateName = $this->translateName($nameFilter);
                $expValue = explode(',', $valueFilter );

                if( count($expValue) > 1 ){
                    $isValidFilter = $this->checkFilter( $infosVh, $translateName, $expValue );//Vérifie que ce véhicule correspond au filtre en cours d'écoute
                }
                else{
                    $isValidFilter = $this->checkFilter( $infosVh, $translateName, $valueFilter );//Vérifie que ce véhicule correspond au filtre en cours d'écoute
                }
                
                //Si le véhicule ne correspond pas à la valeur du filtre alors je ne regarde pas plus loin je passe au suivant
                if(!$isValidFilter) break;
            }

            //Si le véhicule et ok pour tous les filtres
            if( $isValidFilter && !isset($res['aVehicles'][$idVh]) ){
                $res['aVehicles'][$idVh] = $infosVh;
                ++$res['nbResults'];
            }

            ++$res['nbSearch'];
        }

        return new JsonResponse( $res );
       
    }

    private function checkFilter( $arraySearch, $field, $value ){
        $wafy = $this->wafy;

        if( count($value) < 1 ) return true;
        if( $value == "" ) return true;

        if( gettype($value) === 'array' ){
            foreach( $value as $v ){
                $res = $this->checkFilter( $arraySearch, $field, $v );
                if($res){
                    break;
                }
            }
            return $res;
        }
        else{
            //Exception pour les marque, il faut convertir l'id en nom alphabétique
            if( $field === $this->translateName('brand') ){
                $value = $wafy->allStockDetails('vo')['brand'][$value];// $wafy->allStockDetails('vo')['brand'][$value];
            }
            
            
            if( $field === $this->translateName('energy')
                    && \preg_match( '#'.$value.'#i', trim(strtolower($arraySearch[$field])))
                    ){
                return true;
            }
            else if( $field === $this->translateName('energy')
                    && trim(strtolower($value)) === 'hybrid'
                    && \preg_match( '#essence#i', trim(strtolower($arraySearch[$field])))
                    && \preg_match( '#electrique#i', str_ireplace('é', 'e', trim(strtolower($arraySearch[$field]))))
                    ){
                return true;
            }
            else if( $field === $this->translateName('location')
                    && \preg_match('/^'.trim(strtolower($value)).'/', trim(strtolower($arraySearch[$field])))
                    ){
                return true;
            }
            else if( $field === $this->translateName('color')
                    && \preg_match('/'.trim(strtolower($value)).'/i', trim(strtolower($arraySearch[$field])))
                    ){
                return true;
            }
            else if( trim(strtolower($arraySearch[$field])) == trim(strtolower($value)) ){
                return true;
            }
            else{
                return false;
            }
        }

    }

    private function translateName($name){
        switch($name){
            case 'body' :
                return 'sBody';
                break;

            case 'brand' :
                return 'sBrand';//'i_veh_maknatcode';
                break;

            case 'brandModel' :
                return 'sModel';
                break; 
            case 'energy' :
                return 'sFuel';
                break;
            case 'trans' :
                return 's_veh_typtxttranstypecd2lbl';
                break;
            case 'color' :
                return 'sCouleurExt';
                break;
            case 'location' :
                return 's_pve_cp';
                break;
            default :
                return null;
                break;
        }
    }

    private function debug($data){
        echo '<pre>';
        print_r($data);
        echo '</pre>';
    }
}
