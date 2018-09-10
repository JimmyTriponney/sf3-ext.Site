<?php

namespace App\Entity;

class JAWafy
{

    private $authentification = [ 'Authentification' =>
			[
				'iMode' => 1,
				'sId' => '9ab98b1f1e647c65ebedf670363bc813',
				'sPass' => 'LJ45ZD+/ld9#',
				'sIdClient' => '7d04bbbe5494ae9d2f5a76aa1c00fa2f'
			]
            ],
            $lastTypeAllVehicles = null,
            $lastNbAllVehicles = null,
            $lastPageAllVehicles = null,
            $resAllVehicles = null,
            $lastTypeAllVehiclesForSearch = null,
            $lastNbAllVehiclesForSearch = null,
            $lastPageAllVehiclesForSearch = null,
            $resAllVehiclesForSearch = null,
            $lastTypeAllStockDetails = null,
            $resAllStockDetails = null,
            $lastIdOneCar = null,
            $resOneCar = null;

    public function getRes($v){
        $prop = 'res'.(ucfirst($v));
        return $this->$prop;
    }

    /*
		Call API and return JSON
	*/
	private function jsonCURL($url,$data)
	{
        $header = array(
			'Content-Type: application/json',
			'Access-Control-Allow-Origin: *'
		);
		
		//Initialisation of cUrl
		$curl = curl_init();
		
		//Setting cUrl
		curl_setopt($curl, CURLOPT_URL, $url);//Url
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);//Receive return
		curl_setopt($curl, CURLOPT_COOKIESESSION, true);//Start new cookie session
		curl_setopt($curl, CURLOPT_POST, true);//Setting POST method to true
		curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));//Send data with POSt method
		curl_setopt($curl,CURLOPT_HTTPHEADER,$header);//Setting header
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); 
		
		//Send request
		$reponse = curl_exec($curl);

		//Close curl
		curl_close($curl);
		
		//Convert json string to php array
		$reponse = json_decode($reponse,true);
		
		return $reponse;
    }
    
    /*
		Return all vehicles in stock
	*/
    public function allVehicles(string $type = null /*,int $page = null*/,int $nb = null)
    {
        if($this->resAllVehicles !== null && $this->lastTypeAllVehicles === $type /*&& $this->lastPageAllVehicles === $page*/ && $this->lastNbAllVehicles === $nb)
            return $this->resAllVehicles;

        $url = 'https://ws4you.webapp4you.eu/application/s-34/get-publication-liste-vehicules';
        $data = $this->authentification;
        $data['aFilters']['i_veh_destination'] = 1;

        if($nb !== null)
            $data['aFilters']['iPerPage'] = $nb;
        /*
        if($page !== null)
            $data['aFilters']['iOffset'] = $nb*($page-1);
        */
        if(strtolower($type) === 'vn')
            $data['aFilters']['i_veh_typeconfiguration'] = 0;
        elseif(strtolower($type) === 'vo')
            $data['aFilters']['i_veh_typeconfiguration'] = 1;
        elseif(strtolower($type) === 'vd')
            $data['aFilters']['i_veh_typeconfiguration'] = 2;

        $this->lastTypeAllVehicles = $type;
        /*$this->lastPageAllVehicles = $page;*/
        $this->lastNbAllVehicles = $nb;
        $this->resAllVehicles = $this->jsonCURL($url , $data);

        return $this->resAllVehicles;
    }
    
    /*
		Return all vehicles in stock for search bar with get-vehicule NOT WORK
	*/
    public function allVehiclesForSearchWithGetVehicule($dataIn = null)
    {
        $url = 'https://ws4you.webapp4you.eu/application/s-34/get-vehicule';
        $data = $this->authentification;
        $data['iLimit'] = 99999;
        $data['bImages'] = 1;
        //$data['i_veh_destination'] = 1;

        //if($dataIn !== null) $data = array_merge( $data, $dataIn);
        
        $res = $this->jsonCURL($url , $data);

        return ['search' => $data, 'results' => $res, 'nbResults' => count($res)];
    }

    /**
     *  Return all vehicles in stock for search bar with get-publication-liste-vehicules
     */
    public function allVehiclesForSearch($dataIn = null)
    {
        $url = 'https://ws4you.webapp4you.eu/application/s-34/get-publication-liste-vehicules';
        $data = $this->authentification;
        
        $dataIn['i_veh_destination'] = 1;

        if($dataIn !== null) $data['aFilters'] = $dataIn;

        $res = $this->jsonCURL($url , $data);

        foreach( $res['aVehicles'] as $id => $infosVh ){
            if(\preg_match('/id=9fa31f2b874d78fb76d70074c960e47f7e4927dcb716de3747c9f57cf2516a8ebe6ff7695cffaada4ed3adc16a0ddfaa_2$/', $infosVh['aCVehiculeImageDTO']['s_vim_nom'])){
                $res['iNbResults']--;
                unset( $res['aVehicles'][$id] );
            }
        }

        return ['search' => $data, 'results' => $res['aVehicles'], 'nbResults' => $res['iNbResults'], 'iRequest' => $dataIn];
    }

    public function oneCar($id)
    {
        if($this->resOneCar !== null && $this->lastIdOneCar === $id)
            return $this->resOneCar;

        $url = 'https://ws4you.webapp4you.eu/application/s-34/get-publication-vehicule';
		$data = $this->authentification;
        $data['iVehicleId'] = $id;
        
        $this->lastIdOneCar = $id;
        $this->resOneCar = $this->jsonCURL($url,$data);

		return $this->resOneCar;
    }

    public function allStockDetails($type = null)
    {
        if($this->resAllStockDetails !== null && $this->lastTypeAllStockDetails === $type){
            return $this->resAllStockDetails;
        }

        /* New function */
        $body       = [];
        $brandModel = [];
        $brand      = [];
        $energy     = [];
        $trans      = [];
        $color      = [];
        $seat       = [];
        $door       = [];
        $location   = [];

        $url = 'https://ws4you.webapp4you.eu/application/s-34/get-publication-filtres-vehicules';
        $data = $this->authentification;

        //J'ajoute le type de véhicule recherché pour n'avoir que les recherche possible dans ce stock        
        if(strtolower($type) === 'vn')
            $data['i_veh_typeconfiguration'] = 0;
        elseif(strtolower($type) === 'vd')
            $data['i_veh_typeconfiguration'] = 2;
        else
            $data['i_veh_typeconfiguration'] = 1;

        //Récupération des données de la bar de recherche
        $filters = $this->jsonCURL($url,$data);

        foreach($filters as $value){
            //Recover brand
            $brand = $this->recoverKeyValue($brand, $value['iBrandId']);

            //Recover model
            $brandModel = $this->recoverKeyValue($brandModel, $value['sModel']);

            //Recover body
            $body = $this->recoverKeyValue($body, $value['sBodyWork']);

            //Recover fuel
            $energy = $this->recoverKeyValue($energy, $value['sFuel']);

            //Recover color
            $color = $this->recoverKeyValue($color, $value['sColorExt']);

            //Recover seat
            $seat = $this->recoverKeyValue($seat, $value['iNbSeat']);

            //Recover door
            $door = $this->recoverKeyValue($door, $value['iNbDoor']);

            //Recover gearbox
            $trans = $this->recoverKeyValue($trans, $value['iTypGear']);

            //Recover location
            $location = $this->recoverKeyValue($location, $value['sDepartement']);

        }
        
        // Tri des tableaux par ordre alphabétique
        asort($body);
        asort($brand);
        asort($energy);
        asort($trans);
        asort($location);
        asort($color);

        foreach($brandModel as $idBrand => $models){
            asort( $models );
        }

        $res = [
            'brand'         => $brand,
            'brandModel'    => $brandModel,
            'body'          => $body,
            'energy'        => $energy,
            'color'         => $color,
            'seat'          => $seat,
            'door'          => $door,
            'trans'         => $trans,
            'location'      => $location
        ];

        //$this->debug( $res['brandModel'] );
        
        $this->resAllStockDetails = $res;
        $this->lastTypeAllStockDetails = $type;

        return $this->resAllStockDetails;
    }

    public function search($dataIn = null)
    {
        $url = 'https://ws4you.webapp4you.eu/application/s-34/get-publication-liste-vehicules';
        $data = $this->authentification;
        $data['aFilters'] = $dataIn;
        return $ret = ['search' => $data, 'result' => $this->jsonCURL($url,$data)];
    }

    private function recoverKeyValue($targetArray, $array){
        foreach($array as $k => $v){
            if( !empty($k) && !empty($v) ){
                if( gettype($v) === 'array' ){
                    if( !isset($targetArray[$k]) ) $targetArray[$k] = [];
                    $targetArray[$k] = $this->recoverKeyValue($targetArray[$k], $v);
                }
                else{
                    $targetArray[$k] = $v;
                }
            }
                
        }
        return $targetArray;
    }

    public function test()
    {
        $tst = $this->jsonCURL(
                    'https://ws4you.webapp4you.eu/application/s-34/get-publication-filtres-vehicules',
                    $this->authentification
        );
        return $tst;
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
