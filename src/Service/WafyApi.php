<?php

namespace App\Service;

//Controller class
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class WafyApi extends Controller
{
	//Informations pour getClientFournisseur et setLead
    private $imode = null,
            $sid = null,
            $spass = "azE'12Rtgf#",
            $sidclient = null,
			$i = 1;
    

    private $authentification = [ 'Authentification' =>
            [
                'iMode' => 1,
                'sId' => '9ab98b1f1e647c65ebedf670363bc813',
                'sPass' => 'LJ45ZD+/ld9#',
                'sIdClient' => '7d04bbbe5494ae9d2f5a76aa1c00fa2f'
            ]
        ];
    
    //Manual campagne informations
    private $sLeaCampagneLib;

    //Informations uniquement pour setLead
    private $iidcanal = null,
            $ic = 0,
            $iidpointventeaffecte = null,
            $iidclientaffecte = null,
            $labels = [],
            $acleaddata = [
                'CIVILITY' => '',
                'NAME' => '',
                'FIRSTNAME' => '',
                'TYPE' => '',
                'COMPANYNAME' => '',
                'ADDRESS' => '',
                'ZIPCODE' => '',
                'CITY' => '',
                'PHONE' => '',
                'PROPHONE' => '',
                'EMAIL' => '',
                'CLIENT' => '',
                'CELLPHONE' => ''],
            $idCanal = [
            'Jeannin Advanced Car' => [
                    'apv' => '106',
                    'generale' => '107',
                    'direction' => '108',
                    'location' => '109',
                    'marketing' => '134'
                ],
            'Jeannin Advanced Car 77' => [
                    'apv' => '110',
                    'generale' => '111',
                    'direction' => '112',
                    'location' => '113',
                    'marketing' => '134'
                ],
            'Jeannin Automobiles 77' => [
                    'apv' => '114',
                    'generale' => '115',
                    'direction' => '116',
                    'location' => '117',
                    'marketing' => '134'
                ],
            'Jeannin Automobiles' => [
                    'apv' => '118',
                    'generale' => '119',
                    'direction' => '120',
                    'location' => '121',
                    'marketing' => '134'
                ],
            'Jeannin Automobiles 10' => [
                    'apv' => '122',
                    'generale' => '123',
                    'direction' => '124',
                    'location' => '125',
                    'marketing' => '134'
                ],
            'Jeannin Autoprestige 89' => [
                    'apv' => '126',
                    'generale' => '127',
                    'direction' => '128',
                    'location' => '129',
                    'marketing' => '134'
                ],
            'Jeannin New Car SAS' => [
                    'apv' => '130',
                    'generale' => '131',
                    'direction' => '132',
                    'location' => '133',
                    'marketing' => '134'
                ]
        ],
        $idclient = [1030,486,487,598,283,597,602,603];
    
    
    /**
     * setLead
     *
     * @param [type] $lead
     * @return void
     */
    public function setLead($lead = null)
    {
        $urlApi = 'https://ws4you.webapp4you.eu/application/s-5/set-lead';
        
        if($lead)
            $this->addRequest($lead);

        $this->refreshAcLead();

        $data = $this->authentification;
        $data['iIdCanal'] = $this->iIdCanal;
        $data['iIdClientAffecte'] = $this->iidclientaffecte;
        $data['iIdPointVenteAffecte'] = $this->iidpointventeaffecte;
        $data['aCLeadData'] = $this->acleaddata;

        $data['s_lea_campagne_libelle'] = $this->sLeaCampagneLib ?? '';

        $setLead = $this->jsonCURL($urlApi,$data);
        
        /* $this->debug($setLead);
        $this->debug($this->acleaddata);
        $this->debug('hello world !'); */

        if( $setLead['error'] != 0 ) return false;
        return true;
    }

    /**
     * Undocumented function
     *
     * @param Array $lead
     * @return void
     */
    private function addAcLead(Array $lead)
    {
        foreach($lead as $name => $value)
            if( array_key_exists( strtoupper($name), $this->acleaddata ) && !empty($value) )
                if( strtoupper($name) == 'PHONE' && preg_match('#^(\+33|0)(6|7)#', $value) )
                    $this->acleaddata['CELLPHONE'] = [ 'VALUE' => $value, 'ORDER' => $this->ic++ ];
                else
                    $this->acleaddata[strtoupper($name)] = [ 'VALUE' => $value, 'ORDER' => $this->ic++ ];

            elseif( strtoupper($name) == 'MAIL' && !empty($value) )
                $this->acleaddata['EMAIL'] = [ 'VALUE' => $value, 'ORDER' => $this->ic++ ];

            elseif( !empty($value) )
                if( isset($this->acleaddata[$name]) && !empty($this->acleaddata[$name]['VALUE']) )
                    $this->acleaddata[$name."".$this->i++] = [ 'VALUE' => $value, 'LABEL' => ($this->labels[$name] ?? ucfirst($name)), 'ORDER' => $this->ic++ ];
                else
                    $this->acleaddata[$name] = [ 'VALUE' => $value, 'LABEL' => ($this->labels[$name] ?? ucfirst($name)), 'ORDER' => $this->ic++ ];
    }
    
    /**
     * Undocumented function
     *
     * @param [type] $lead
     * @return void
     */
    public function addRequest($lead)
    {
        
        foreach($lead as $name => $value):
            if(gettype($value) !== 'array'):
                $this->addAcLead([$name => $value]);
            else:
                foreach($value as $v):
                    $this->addRequest([$name => $v]);
                endforeach;
            endif;
        endforeach;
        
    }

    public function refreshAcLead()
    {
        foreach($this->acleaddata as $key => $value)
            if(!$value || preg_match('/^\_+/', $key) || in_array( strtolower($key), ['send','submit','envoyer','enregistrer']) )
                unset($this->acleaddata[$key]);
    }

    public function addLabel($labels)
    {   
        foreach($labels as $name => $label)
                $this->labels[$name] = $label;
    }











    /**
     * initByCar
     *
     * @param Int $id
     * @return void
     */
    public function initByCar(Array $car, String $canal)
    {
        $iPveId = $car['aVehicle']['i_pve_id'];
        $brandNatCode = $car['aVehicle']['iBrandNatCode'];

        $client = $this->getClientFournisseurById($iPveId);

        $clientNom = $client['s_cli_nom'];

        //Recover canal's id
        $this->iIdCanal = $this->idCanal[$clientNom][$canal];

        //Recover seller's informations
        $this->authentification['Authentification']['sIdClient'] = $client['i_cli_id'];
        $this->iidclientaffecte = $this->getIdclientaffecte($client['i_cli_id']);
        $this->iidpointventeaffecte = $iPveId;
    }








    /**
     * getClientFournisseurById
     *
     * @param Int $id
     * @return void
     */
    public function getClientFournisseurById(Int $id)
    {
        $allClient = $this->getClientFournisseur();

        if( !$allClient )
            return false;

        foreach($allClient as $client)
            foreach($client['a_pve'] as $pdv)
                if($pdv['i_pve_id'] == $id)
                    return $client;//$pdv;
               
        return false;
    }

    /**
     * getClientFournisseur
     *
     * @return void
     */
    private function getClientFournisseur()
    {
        $urlApi = 'https://ws4you.webapp4you.eu/application/s-0/get-client-fournisseur';
        $auth = $this->authentification;
        $clientFournisseur = $this->jsonCURL($urlApi,$auth);
        
		if( isset($clientFournisseur['error']) )
            return false; /*throw $this->createNotFoundException('Le véhicule que vous cherchez est introuvable.');*/
    
        return $clientFournisseur;
    }

    /**
     * GetVehicleById
     *
     * @param Int $id
     * @return void
     */
    public function getVehicleById(Int $id)
    {	
		$urlApi = 'https://ws4you.webapp4you.eu/application/s-34/get-publication-vehicule';
		$auth = $this->authentification;
		$auth['iVehicleId'] = $id;
		$carDetails = $this->jsonCURL($urlApi,$auth);
		
		if( isset($carDetails['error']) )
			return false;
		
		return $carDetails;//['aVehicle'];
    }

    private function getIdclientaffecte(String $idMd5)
    {   
        foreach($this->idclient as $id)
            if( md5($id) === $idMd5)
                return $id;
    }

	/**
     * jsonCurl
     *
     * @param String $url
     * @param Array $data
     * @return void
     */
	private function jsonCURL(String $url,Array $data)
	{
		$header = array('Content-Type: application/json');
		
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
		Show debug
	*/
	private function debug($var)
	{
		echo '<pre>';
		print_r($var);
		echo '</pre>';
	}
    


    /**
     * Get the value of sLeaCampagneLib
     */ 
    public function getSLeaCampagneLib()
    {
        return $this->sLeaCampagneLib;
    }

    /**
     * Set the value of sLeaCampagneLib
     *
     * @return  self
     */ 
    public function setSLeaCampagneLib(String $sLeaCampagneLib)
    {
        $this->sLeaCampagneLib = $sLeaCampagneLib;
        return $this;
    }
}
