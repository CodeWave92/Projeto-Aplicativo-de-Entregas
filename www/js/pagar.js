 //Código para mascarar os campos
 $(document).ready(function () {
    $('#cardNumber').inputmask('9999 9999 9999 9999');
    $('#expiryDate').inputmask('99/99');
    $('#cvv').inputmask('999');
    $('#cardForm').submit(function (event) {
        event.preventDefault();
       
    });
});

//Emissão de comprovante de pagamento
   //Verificar os campos preenchidos
    function verificarCamposPreenchidos() {
    var nome = document.getElementById('nome').value.trim();
    var cardNumber = document.getElementById('cardNumber').value.trim();
    var expiryDate = document.getElementById('expiryDate').value.trim();
    var cvv = document.getElementById('cvv').value.trim();
    var btnEnviar = document.getElementById('btnEnviar');

    btnEnviar.disabled = nome === '' || cardNumber === '' || expiryDate === '' || cvv === '';
}

//Exibe os dados de outras telas, como o metodo de pagamento, bandeira do cartão e o valor total
var urlParams1 = new URLSearchParams(window.location.search);
        var opcaoSelecionada = urlParams1.get('opcao');
        document.querySelector('#cartao').textContent += " " +" "+ opcaoSelecionada;
              const paymentType1 = sessionStorage.getItem("paymentType");
          document.querySelector('#bandeira_cartao').textContent +=" "+ "-"+" " + paymentType1;
        var urlParams = new URLSearchParams(window.location.search);
        var valorRecebido = urlParams.get('valor');
        document.querySelector('#valor').textContent += " " + valorRecebido;
        document.querySelector('#valor_total').textContent += " " + valorRecebido;