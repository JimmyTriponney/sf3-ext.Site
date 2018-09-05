<?php
namespace App\Service;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ValidForm extends Controller
{
    private $request,
            $errors,
            $param,
            $pattern = [
                'field' => '/\{\{[ ]?field[ ]?\}\}/i',
                'value' => '/\{\{[ ]?value[ ]?\}\}/i',
                'min' => '/\{\{[ ]?min[ ]?\}\}/i',
                'max' => '/\{\{[ ]?max[ ]?\}\}/i',

                'phone' => [
                        'all' => '/^(\+[0-9]{1,3}|0)+[0-9]{9}$/',
                        'phone' => '/^(\+[0-9]{1,3}|0)+[1234589]+[0-9]{8}$/',
                        'cell' => '/^(\+[0-9]{1,3}|0)+[67]+[0-9]{8}$/',
                    ],
                'mail' => '/^[a-z0-9._-]+\@[a-z0-9._-]+\.[a-z0-9._-]+(\.[a-z0-9._-]+)?$/i',
                'isInt' => '/\d*/i',
            ];

    public function validate()
    {
        $param = $this->param;

        foreach($param as $fieldName => $fieldParam)
            foreach($fieldParam as $filter => $filterParam)
                if( method_exists($this, $filter) && $filterParam !== false )
                    $this->$filter($fieldName, $filterParam);

        if( count($this->errors) ) return $this->errors;
        return true;
    }
    
    /**
     * Required
     *
     * @param String $fieldName
     * @param [String | Array] $filterParam
     * @return void
     */
    private function required(String $fieldName, $filterParam)
    {
        $data = $this->request->get($fieldName) ?? null;

        if($data === null || empty($data) )
            if( gettype($filterParam) === 'array' )
                $this->errors['required'][$fieldName] = $this->createMessage('field', $fieldName, $filterParam['message']);
            elseif( gettype($filterParam) === 'string' )
                $this->errors['required'][$fieldName] = $this->createMessage('field', $fieldName, $filterParam);
            else
                $this->errors['required'][$fieldName] = "Le champ ".$fieldName." est requis";
    }
    
    /**
     * Length
     *
     * @param String $fieldName
     * @param [String | Array] $filterParam
     * @return void
     */
    private function length(String $fieldName, $filterParam)
    {
        $data = $this->request->get($fieldName);
        $min = $filterParam['min'] ?? null;
        $max = $filterParam['max'] ?? null;
        $len = $this->strRealLen($data);
        $messMin = $filterParam['messageMin'] ?? null;
        $messMax = $filterParam['messageMax'] ?? null;
        $mess = $filterParam['message'] ?? 'Le champ {{field}} doit contenir entre {{min}} et {{max}} charactères.';

        if( $min !== null && $len < $min )
            $this->errors['length'][$fieldName] = $this->createMessage( ['field','value','min','max'], [$fieldName,$data,$min,$max], ($messMin ?? $mess) );
        elseif( $max !== null && $len > $max)
            $this->errors['length'][$fieldName] = $this->createMessage( ['field','value','min','max'], [$fieldName,$data,$min,$max], ($messMax ?? $mess) );
    }

    /**
     * Phone
     *
     * @param String $fieldName
     * @param [String | Array] $filterParam
     * @return void
     */
    private function phone(String $fieldName, $filterParam)
    {
        $data = $this->request->get($fieldName);
        $type = $filterParam['type'] ?? 'all';
        $mess = $filterParam['message'] ?? ($filterParam ?? 'Le numéro de téléphone de ce champ "{{value}}" est incorrect.');
        $escapeData = preg_replace('/[ _.,;:*-]/', '', $data);
        $patternAll = $this->pattern['phone'][$type];

        if( !preg_match($this->pattern['phone'][$type], $escapeData) )
            $this->errors['phone'][$fieldName] = $this->createMessage( ['field','value'], [$fieldName,$data], $mess );
    }

    /**
     * Mail
     *
     * @param String $fieldName
     * @param [String | Array] $filterParam
     * @return void
     */
    private function mail(String $fieldName, $filterParam)
    {
        $data = $this->request->get($fieldName);
        $mess = $filterParam['message'] ?? ($filterParam ?? 'L\'email "{{value}}" est incorrect.');

        if( !preg_match($this->pattern['mail'], $data) )
            $this->errors['mail'][$fieldName] = $this->createMessage( ['field','value'], [$fieldName,$data], $mess );
    }


    private function isInt(String $fieldName, $filterParam)
    {
        $data = $this->request->get($fieldName);
        $mess = $filterParam['message'] ?? ($filterParam ?? 'La valeur "{{value}} n\'est pas numérique"');

        if( !preg_match( $this->pattern['isInt'], $data) ) $this->createMessage( ['field','value'], [$fieldName,$data], $mess );
    }




    private function createMessage($index, $replace, String $message)
    {
        if(gettype($index) === 'string')
            $message = preg_replace( $this->pattern[$index], $replace, $message);
        elseif(gettype($index) === 'array')
            foreach($index as $k => $value)
                if(gettype($replace) === 'string')
                    $message = preg_replace( $this->pattern[$value], $replace, $message);
                elseif(gettype($replace) === 'array')
                    if(isset($replace[$k]))
                        $message = preg_replace( $this->pattern[$value], $replace[$k], $message);
                    else
                        $message = preg_replace( $this->pattern[$value], end($replace), $message);
                            
        return $message;
    }

    private function strRealLen(String $str)
    {
        $str =  preg_replace('/&[a-z]*\;/i', 'e', htmlentities($str));
        return strlen($str);
    }

    /**
     * Set the value of request
     *
     * @return  self
     */ 
    public function setRequest(Request $request)
    {
        $this->request = $request->request;
        return $this;
    }

    /**
     * Set the value of param
     *
     * @return  self
     */ 
    public function setParam(Array $param)
    {
        $this->param = $param;
        return $this;
    }
}