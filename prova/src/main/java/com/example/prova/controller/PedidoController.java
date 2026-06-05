package com.example.prova.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.prova.entities.Pedido;
import com.example.prova.entities.StatusPedido;
import com.example.prova.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Pedido> criarPedido(@RequestBody Pedido pedido) {
        Pedido salvo = service.salvar(pedido);
        return ResponseEntity.created(URI.create("/api/pedidos/" + salvo.getId())).body(salvo);
    }

    @PostMapping("/{id}/avancar")
    public ResponseEntity<Pedido> avancarStatus(@PathVariable("id") Long id) {
    
        Pedido pedido = service.buscarPorId(id);
    
        switch (pedido.getStatus()) {
            case RECEBIDO -> pedido.setStatus(StatusPedido.PREPARANDO);
        
            case PREPARANDO -> pedido.setStatus(StatusPedido.CAMINHO);
        
            case CAMINHO -> pedido.setStatus(StatusPedido.ENTREGUE);
        
            default -> {
            }
        }
    
        Pedido atualizado = service.salvar(pedido);
    
        return ResponseEntity.ok(atualizado);
    }
    

    @GetMapping
    public ResponseEntity<List<Pedido>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }
}
