<?php

namespace App\Service;

//Controller class
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class WafyApiManager extends Controller
{
	//Informations pour getClientFournisseur et setLead
    private $imode = null,
            $sid = null,
            $spass = "azE'12Rtgf#",
            $sidclient = null,
			$i = 1;
    
    //Informations uniquement pour setLead
    private $iidcanal = null,
            $ic = 0,
            $iidpointventeaffecte = null,
            $iidclientaffecte = null,
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
    
    public function setImode($imode)
    {
        $this->imode = $imode;
    }
    public function setSid($sid)
    {
        $this->sid = $sid;
    }
    public function setSpass($spass)
    {
        $this->spass = $spass;
    }
    public function setSidclient($sidclient)
    {
        $this->sidclient = $sidclient;
    }
    public function setIidcanal($iidcanal)
    {
        $this->iidcanal = $iidcanal;
    }
    public function setIidclientaffecte($iidclientaffecte)
    {
        $this->iidclientaffecte = $iidclientaffecte;
    }
    public function setIidpointventeaffecte($iidpointventeaffecte)
    {
        $this->iidpointventeaffecte = $iidpointventeaffecte;
    }
	
	public function addAcleaddata($arr, $validator)
    {
        $tradName = $validator->getTradName();
        $label = '';
        foreach($arr as $k => $v):
            if(array_key_exists(strtoupper($k),$this->getProp('acleaddata'))):
			
                if(strtoupper($k) == 'PHONE' && preg_match('#^(\+33|0)(6|7)#',$v)):
                    $this->acleaddata['CELLPHONE'] = ["VALUE" => $v,"ORDER" => $this->ic++];
                else:
                    $this->acleaddata[strtoupper($k)] = ["VALUE" => $v,"ORDER" => $this->ic++];
                endif;
				
            else:
			
                if(isset($tradName[$k])):
                    $label = $tradName[$k];
				else:
					$label = $k;
                endif;
				
				
				if( isset($this->acleaddata[$k]) && !empty($this->acleaddata[$k]) ):
					$this->acleaddata[$k."".$this->i] = ["VALUE" => $v,"LABEL"=>$label." ".$this->i,"ORDER" => $this->ic++];
					$this->i++;
				else:
					$this->acleaddata[$k] = ["VALUE" => $v,"LABEL"=>$label,"ORDER" => $this->ic++];
				endif;
				
            endif;
        endforeach;
	}
	
    public function removeAcleaddata($index)
    {
        if(isset($this->acleaddata[$index])):
            unset($this->acleaddata[$index]);
        endif;
    }
	
    public function addRequest($arr, $validator)
    {
        
        foreach($arr as $input => $value):
            if(gettype($value) !== 'array'):
                $this->addAcleaddata([$input => $value],$validator);
            else:
                foreach($value as $v):
                    $this->addRequest([$input => $v],$validator);
                endforeach;
            endif;
        endforeach;
        
    }
    
    public function getProp($property){
        if(property_exists($this,$property)):
            return $this->$property;
        endif;
            return null;
    }
    
    public function wafyCall($method)
    {
		
		foreach($this->acleaddata as $k => $v):
			if(!$v)$this->removeAcleaddata($k);
		endforeach;
		
        if($method === 'getClientFournisseur'):
            $url = 'https://ws4you.webapp4you.eu/application/s-0/get-client-fournisseur';
            if($this->imode !== null && $this->sid !== null && $this->spass !== null && $this->sidclient !== null):
                $data = array('Authentification' => array(
                                        'iMode' => $this->imode,
                                        'sId' => $this->sid,
                                        'sPass' => $this->spass,
                                        'sIdClient' => $this->sidclient)
                    );
            else:
                return false;
            endif;
        elseif($method === 'setLead'): 
            
            $url = 'https://ws4you.webapp4you.eu/application/s-5/set-lead';
            
            if($this->iidclientaffecte !== null && $this->imode !== null && $this->sid !== null && $this->spass !== null && $this->sidclient !== null && $this->iidcanal !== null && $this->iidpointventeaffecte !== null):
            			
                $data = array('Authentification' => array(
                                    'iMode' => $this->imode,
                                    'sId' => $this->sid,
                                    'sPass' => $this->spass,
                                    'sIdClient' => $this->sidclient),
                            'iIdCanal' => $this->iidcanal,
                            'iIdClientAffecte' => $this->iidclientaffecte,
                            'iIdPointVenteAffecte' => $this->iidpointventeaffecte,
                            'aCLeadData' => $this->acleaddata
                    );
				
			else:
                return false;
            endif;
        else:
            return false;
        endif;
        
        if(isset($url) && isset($data)):
            $data = $data;
            $data_json = json_encode($data);
            $header = array(
                'Content-Type: application/json'
            );
            
            $ch= curl_init($url);
            curl_setopt($ch,CURLOPT_CUSTOMREQUEST,"POST");
            curl_setopt($ch,CURLOPT_POSTFIELDS,$data_json);
            curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
            curl_setopt($ch,CURLOPT_HTTPHEADER,$header);
            
            $reponse_json = curl_exec($ch);
            curl_close($ch);
            $reponse_array = json_decode($reponse_json,true);
            
            return $reponse_array;
            
        else:
            return false;
        endif;
    }
    
    public function compareIdClient($md5)
    {
        foreach($this->idclient as $id):
            if(md5($id) == $md5):
                return $id;
            endif;
        endforeach;
    }
    
    public function changeForDestinataire($reponse,$city,$brand,$canal)
    {
        $break = false;
        
        foreach($reponse as $client):
            
            $i_cli_id = $client['i_cli_id'];
            $idClientAffect = $this->compareIdClient($i_cli_id);
            $s_cli_nom = $client['s_cli_nom'];
            $iIdCanal = $this->idCanal[$s_cli_nom][$canal];
             
            foreach($client['a_pve'] as $pve):
                $s_pve_ville = $pve['s_pve_ville'];
                $i_pve_id = $pve['i_pve_id'];
                if(strtolower($s_pve_ville) == strtolower($city)):
                    foreach($pve['a_pvm'] as $id_pvm => $pvm):
                        $s_cma_marque_libelle = $pvm['s_cma_marque_libelle'];
                        if(strtolower($s_cma_marque_libelle) == strtolower($brand)):
                            $a_pvm_id = $id_pvm;       
                            $break = true;
                            break;
                        endif;
                    endforeach;
                    if($break)break;
                endif;
            endforeach;
            if($break)break;
        endforeach;
        
        //Recherche avec entité et marque
        if(!$break):
            
            $cm = new ConcessionManager();
            $Concession = $cm->getOneByBrandAndCityAndSecteur($brand,$city,$canal);
            $s_cli_nom = $Concession->getNom();
            $iIdCanal = $this->idCanal[$s_cli_nom][$canal];
            
            foreach($reponse as $client):
                if(strtolower($s_cli_nom) == strtolower($client['s_cli_nom'])):
                    $i_cli_id = $client['i_cli_id'];
                    $idClientAffect = $this->compareIdClient($i_cli_id);
                    foreach($client['a_pve'] as $pve):
                        $s_pve_ville = $pve['s_pve_ville'];
                        $i_pve_id = $pve['i_pve_id'];
                            foreach($pve['a_pvm'] as $id_pvm => $pvm):
                                if(strtolower($brand) == strtolower($pvm['s_cma_marque_libelle'])):
                                    $a_pvm_id = $id_pvm;       
                                    $break = true;
                                    break;
                                endif;
                            endforeach;
                        if($break)break;
                    endforeach;
                endif;
                if($break)break;
            endforeach; 
        endif;
        
        //Recherche avec entitté et ville
        if(!$break):
            
            $cm = new ConcessionManager();
            $Concession = $cm->getOneByBrandAndCityAndSecteur($brand,$city,$canal);
            $s_cli_nom = $Concession->getNom();
            $iIdCanal = $this->idCanal[$s_cli_nom][$canal];
            
            foreach($reponse as $client):
                if(strtolower($s_cli_nom) == strtolower($client['s_cli_nom'])):
                    $i_cli_id = $client['i_cli_id'];
                    $idClientAffect = $this->compareIdClient($i_cli_id);
                    foreach($client['a_pve'] as $pve):
                        $s_pve_ville = $pve['s_pve_ville'];
                        $i_pve_id = $pve['i_pve_id'];
                        if(strtolower($s_pve_ville) == strtolower($city)):
                            foreach($pve['a_pvm'] as $id_pvm => $pvm):
                                $a_pvm_id = $id_pvm;       
                                $break = true;
                                break;
                            endforeach;
                        endif;
                        if($break)break;
                    endforeach;
                endif;
                if($break)break;
            endforeach; 
        endif;
        
        if($break):
            $this->setSidclient($i_cli_id);
            $this->setIidcanal($iIdCanal);
            $this->setIidpointventeaffecte($i_pve_id);
            $this->setIidclientaffecte($idClientAffect);
            return true;
        else:
            $this->setSidclient('e515df0d202ae52fcebb14295743063b');
            $this->setIidcanal(134);
            $this->setIidpointventeaffecte(17);
            $this->setIidclientaffecte(1030);
            return true;
        endif;
        
    }
    
    /*
	public function __construct($data)
    {
        foreach($data as $key => $value)
        {
            $method = 'set'.$key;
            if(method_exists($this,$method))
                        $this->$method($value);
        }
    }
	*/
}
