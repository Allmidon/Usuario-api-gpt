async function enviarMensaje() {
    const inputMensaje = document.getElementById("prompt").value;
    const respuestaElemento = document.getElementById("respuesta");

    if (inputMensaje.trim() === "") {
        respuestaElemento.textContent = "Por favor, escribe un mensaje.";
        return;
    }

    const url = "http://44.222.174.113/api-gpt-php/endpoints/chat.php";
    const datos = { message: inputMensaje };

    console.log("Enviando datos a la API:", datos);

    try {
        const respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        console.log("Respuesta HTTP:", respuesta.status);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const resultado = await respuesta.json();
        console.log("Respuesta de la API:", resultado);

        if (resultado?.status === 200 && resultado?.data?.reply) {
            respuestaElemento.textContent = resultado.data.reply;
        } else {
            respuestaElemento.textContent = "Error en la respuesta de la API.";
            console.error("Estructura inesperada:", resultado);
        }
    } catch (error) {
        respuestaElemento.textContent = "Error en la conexión con la API.";
        console.error("Error en fetch:", error);
    }
}
