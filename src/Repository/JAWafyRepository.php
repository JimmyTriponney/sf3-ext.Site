<?php

namespace App\Repository;

use App\Entity\JAWafy;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method JAWafy|null find($id, $lockMode = null, $lockVersion = null)
 * @method JAWafy|null findOneBy(array $criteria, array $orderBy = null)
 * @method JAWafy[]    findAll()
 * @method JAWafy[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class JAWafyRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, JAWafy::class);
    }

    /*
    public function findBySomething($value)
    {
        return $this->createQueryBuilder('j')
            ->where('j.something = :value')->setParameter('value', $value)
            ->orderBy('j.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */
}
