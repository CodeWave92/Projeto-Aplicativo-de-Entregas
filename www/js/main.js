var vilaOceanopolisCoordinates = { lat: -24.124388, lng: -46.696362 };

var mapOptions = {
    center: vilaOceanopolisCoordinates,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

document.getElementById("output").style.display = "none";

var map = new google.maps.Map(document.getElementById('google-map'), mapOptions);

var directionsService = new google.maps.DirectionsService();

var directionsDisplay = new google.maps.DirectionsRenderer();

directionsDisplay.setMap(map);

function calcRoute() {
    var request = {
        origin: document.getElementById("location-1").value,
        destination: document.getElementById("location-2").value,
        travelMode: google.maps.TravelMode.BICYCLING,
        unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var distanceInMeters = result.routes[0].legs[0].distance.value; // Obtém a distância em metros
            var distanceInKm = distanceInMeters / 1000; // Converte para quilômetros
            var costInCents;

            if (distanceInKm > 20) {
                alert("A distância é maior do que 20 km. Não é possível realizar a entrega.");
                clearRoute();
                return; // Encerra a função sem calcular o custo se a distância for maior que 20 km
            } else if (distanceInKm <= 10) {
                costInCents = distanceInMeters * 0.01; // Custo padrão (1 centavo por metro)
            } else {
                var baseCost = 10 * 1000 * 0.01; // Custo base para os primeiros 10 km (1 centavo por metro)
                var additionalDistance = distanceInKm - 10; // Calcula a distância adicional

                // Calcula o custo total incluindo o acréscimo de 25% para distâncias acima de 10 km
                costInCents = baseCost + (additionalDistance * 0.01 * 1.25); // Acréscimo de 25% sobre o custo adicional
            }

            var formattedDistance = result.routes[0].legs[0].distance.text;
            var formattedDuration = result.routes[0].legs[0].duration.text;

            $("#output").html("<div class='result-table'> Distancia: " + formattedDistance + ".<br />Tempo estimado: " + formattedDuration + ".<br />Preço: " + costInCents.toFixed(2) + " R$</div>");
            document.getElementById("output").style.display = "block";

            directionsDisplay.setDirections(result);
        } else {
            directionsDisplay.setDirections({ routes: [] });
            map.setCenter(centerOfSaoPauloState);

            alert("Impossível passar por este caminho! Tente outro.");
            clearRoute();
        }
    });
}

function clearRoute() {
    document.getElementById("output").style.display = "none";
    document.getElementById("location-1").value = "";
    document.getElementById("location-2").value = "";
    directionsDisplay.setDirections({ routes: [] });
}

var options = {
    types: ['address']
};

var input1 = document.getElementById("location-1");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

var input2 = document.getElementById("location-2");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

// Função para obter a localização atual do usuário
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    var geocoder = new google.maps.Geocoder();
    var latlng = { lat: latitude, lng: longitude };

    geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                document.getElementById('location-1').value = results[0].formatted_address;
            }
        }
    });
}

$(document).ready(function () {
    var deliveryHistory = [];

    function displayDeliveryHistory() {
        var historyContent = '';
        if (deliveryHistory.length > 0) {
            deliveryHistory.forEach(function (delivery, index) {
                var status = delivery.accepted ? (delivery.confirmed ? "Entrega Confirmada" : "Entrega Aceita, Aguardando Confirmação") : "Entrega Pendente";
                var deliveryDateTime = new Date().toLocaleString(); // Obtém data e hora atuais
                historyContent += "<p><strong>Entrega " + (index + 1) + ":</strong> " + status + "<br>Preço: " + delivery.price + " R$<br>Data e Hora do Pedido: " + deliveryDateTime + "</p>";
            });
        } else {
            historyContent = "<p>Nenhuma entrega pendente no momento.</p>";
        }
        $("#deliveryHistory").html(historyContent);
    }

    function saveDeliveryToSessionStorage() {
        sessionStorage.setItem("currentDelivery", JSON.stringify(deliveryHistory));
    }

    $("#acceptDelivery").on("click", function () {
        var price = parseFloat($("#output .result-table").text().match(/\d+\.\d+/)[0]);
        if (deliveryHistory.length > 0 && !deliveryHistory[deliveryHistory.length - 1].accepted) {
            alert("Você já tem uma entrega pendente para aceitar. Confirme ou cancele a entrega anterior antes de aceitar uma nova.");
        } else {
            alert("Redirecionando para a tela de pagamento...");
            window.location.href = "TelaPagamento.html"
            deliveryHistory.push({
                accepted: true,
                confirmed: false,
                price: price,
            });
            displayDeliveryHistory();
            saveDeliveryToSessionStorage(); // Salva os dados no sessionStorage
        }
    });

    $("#confirmDelivery").on("click", function () {
        if (deliveryHistory.length === 0) {
            alert("Não há entrega para confirmar.");
        } else if (!deliveryHistory[deliveryHistory.length - 1].accepted) {
            alert("Por favor, aceite a entrega antes de confirmar.");
        } else if (deliveryHistory[deliveryHistory.length - 1].confirmed) {
            alert("Entrega já confirmada anteriormente!");
        } else {
            alert("Entrega confirmada!");
            deliveryHistory[deliveryHistory.length - 1].confirmed = true;
            displayDeliveryHistory();
            saveDeliveryToSessionStorage(); // Salva os dados no sessionStorage após a confirmação
        }
    });

    if (sessionStorage.getItem("currentDelivery")) {
        deliveryHistory = JSON.parse(sessionStorage.getItem("currentDelivery"));
        displayDeliveryHistory();
    }
});
