import { View, Button, StyleSheet, TextInput, Alert, FlatList, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { usarBD } from './hooks/usarBD';
import { Produto } from './components/produto';
import React, { useEffect } from 'react';

export function Index() {
    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [pesquisa, setPesquisa] = useState('');
    const [produtos, setProdutos] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const produtosBD = usarBD();

    async function createOrUpdate() {
        if (isNaN(quantidade)) {
            return Alert.alert('Quantidade', 'A quantidade precisa ser um número!');
        }

        try {
            if (selectedId) {
                await produtosBD.update({
                    id: selectedId,
                    nome,
                    quantidade: Number(quantidade),
                });
                Alert.alert('Produto atualizado com sucesso!');
            } else {
                const item = await produtosBD.create({
                    nome,
                    quantidade: Number(quantidade),
                });
                Alert.alert('Produto cadastrado com o ID: ' + item.idProduto);
                setId(item.idProduto);
            }
            limparCampos();
            listar();
        } catch (error) {
            console.log(error);
        }
    }

    async function listar() {
        try {
            const captura = await produtosBD.read(pesquisa);
            setProdutos(captura);
        } catch (error) {
            console.log(error);
        }
    }

    const limparCampos = () => {
        setNome('');
        setQuantidade('');
        setSelectedId(null);
    };

    useEffect(() => {
        listar();
    }, [pesquisa]);

    const remove = async (id) => {
        try {
            await produtosBD.remove(id);
            await listar();
        } catch (error) {
            console.log(error);
        }
    };

    const selecionarProduto = (produto) => {
        setSelectedId(produto.id);
        setNome(produto.nome);
        setQuantidade(String(produto.quantidade));
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput} placeholder="Nome" onChangeText={setNome} value={nome} />
            <TextInput style={styles.textInput} placeholder="Quantidade" onChangeText={setQuantidade} value={quantidade} keyboardType="numeric" />
            
            <TouchableOpacity style={styles.button} onPress={createOrUpdate}>
                <Text style={styles.buttonText}>{selectedId ? "Atualizar" : "Salvar"}</Text>
            </TouchableOpacity>
            
            <TextInput style={styles.textInput} placeholder="Pesquisar" onChangeText={setPesquisa} value={pesquisa} />
            
            <FlatList
                contentContainerStyle={styles.listContent}
                data={produtos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <Produto
                        data={item}
                        onPress={() => selecionarProduto(item)}
                        isSelected={item.id === selectedId}
                        onDelete={() => remove(item.id)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 24,
        marginTop: 100,
        justifyContent: 'center',
    },
    textInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#325c28',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContent: {
        paddingTop: 16,
    },
});
