package com.example.prova.entities;


import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sabor;
    private String tamanho;

    @Enumerated(EnumType.STRING)
    private StatusPedido status = StatusPedido.RECEBIDO;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
         return id; }

    public String getSabor() { 
        return sabor; }

    public void setSabor(String sabor) { 
        this.sabor = sabor; }

    public String getTamanho() { 
        return tamanho; }

    public void setTamanho(String tamanho) { 
        this.tamanho = tamanho; }

    public LocalDateTime getCreatedAt() { 
        return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public StatusPedido getStatus() {
    return status;
    }

    public void setStatus(StatusPedido status) {
        this.status = status;
    }
}
