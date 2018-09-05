<?php

namespace App\Service;

class HTML2PDF
{

	private $pdf;

	public function create($orientation = null, $format = null, $lang = null, $unicode = null, $encoding = null, $margin = null)
	{
		$this->pdf = new \HTML2PDF(
				$orientation ?? $this->orientation,
				$format ?? $this->format,
				$lang ?? $this->lang,
				$unicode ?? $this->unicode,
				$encoding ?? $this->encoding,
				$margin ?? $this->margin
			);
	}

	public function generatePdf($template, $name)
	{
		$this->pdf->writeHTML($template);
		return $this->pdf->Output($name.'.pdf');
	}
}