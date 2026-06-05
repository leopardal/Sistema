package com.example.prova.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.prova.entities.Pedido;
import com.example.prova.repository.PedidoRepository;

@Service
public class PedidoService {

    private final PedidoRepository repo;

    public PedidoService(PedidoRepository repo) {
        this.repo = repo;
    }

    public Pedido salvar(Pedido pedido) {
        return repo.save(pedido);
    }

    public Pedido buscarPorId(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
    }

    public List<Pedido> listarTodos() {
        return repo.findAll();
    }
}