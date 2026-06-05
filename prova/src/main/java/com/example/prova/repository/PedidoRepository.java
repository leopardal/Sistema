package com.example.prova.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.prova.entities.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
}