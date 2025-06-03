// Prefijo que se usará como palabra clave para activar comandos
const ordenPrefijo = "GERARDO";

// Espera a que el contenido del DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
    // Obtención de referencias a los elementos del DOM
    const startBtn = document.getElementById("startBtn"); // Botón para iniciar el reconocimiento de voz
    const outputText = document.getElementById("outputText"); // Área donde se mostrará el mensaje detectado
    const msgText = document.getElementById("msgText"); // Mensaje de estado del reconocimiento de voz

    // Mensaje inicial que se mostrará en la interfaz
    outputText.innerHTML = `Di ${ ordenPrefijo } para ver el mensaje`;

    let recognition; // Objeto para manejar el reconocimiento de voz
    let stoppedManually = false; // Bandera para determinar si la detención fue manual

    // Verificar si el navegador soporta reconocimiento de voz
    if ("webkitSpeechRecognition" in window) {
        recognition = new webkitSpeechRecognition(); // Inicialización del reconocimiento de voz
        recognition.continuous = true; // Permite que la escucha continúe indefinidamente
        recognition.lang = "es-ES"; // Configuración del idioma a español de España
    } else {
        alert("Tu navegador no soporta reconocimiento de voz.");
        return; // Salir del script si el navegador no es compatible
    }

    // Evento de clic en el botón para iniciar el reconocimiento de voz
    startBtn.addEventListener("click", () => {
        console.log("Botón presionado"); // Verifica que este mensaje aparezca en la consola
        stoppedManually = false; // Restablece la bandera de detención manual
        recognition.start(); // Inicia el reconocimiento de voz
        startBtn.disabled = true; // Deshabilita el botón mientras se está escuchando
        outputText.textContent = `Escuchando...Di ${ ordenPrefijo } para interactuar.`;
    msgText.innerHTML = ""; // Limpia mensajes anteriores
});

// Evento que maneja los resultados del reconocimiento de voz
recognition.onresult = async (event) => {
    let transcript = event.results[event.results.length - 1][0].transcript.trim().toUpperCase(); // Obtiene y formatea el texto reconocido
    console.log("Texto reconocido:", transcript);

    // Si el usuario dice "GERARDO DETENTE", se detiene el reconocimiento
    if (transcript.includes(ordenPrefijo + " DETENTE")) {
        stoppedManually = true; // Marca que la detención fue manual
        recognition.stop(); // Detiene el reconocimiento
        startBtn.disabled = false; // Habilita nuevamente el botón de inicio
        outputText.textContent = "Detenido. Presiona el botón para comenzar nuevamente.";
        msgText.innerHTML = ""; // Limpia mensajes anteriores
    }
    // Si la frase contiene la palabra clave "VENUS", se muestra el mensaje detectado
    else if (transcript.includes(ordenPrefijo)) { //Comprueba si la variable transcript (posiblemente un texto capturado por reconocimiento de voz) contiene la cadena ordenPrefijo.
        outputText.innerHTML = `Mensaje detectado: "<strong><em>${transcript}</em></strong>"`; //Muestra en el elemento outputText el mensaje capturado (transcript), resaltándolo en negrita y cursiva.
        msgText.innerHTML = ""; //Borra el contenido del elemento msgText (posiblemente un área de mensaje de estado o advertencia).

        try { // Envía el mensaje a la API de OpenAI
            const response = await fetch('http://44.222.150.33/api-gpt-php/endpoints/chat.php', { //hace una solicitud fetch a la API
                method: 'POST', //La solicitud es de tipo POST, lo que significa que se enviará información al servidor.
                headers: {
                    'Content-Type': 'application/json', //Se especifica que el contenido es de tipo JSON.
                },
                body: JSON.stringify({ message: transcript }), //Se convierte el objeto { message: transcript } en una cadena JSON y se envía en el cuerpo de la solicitud.
            });

            const data = await response.json(); //Se espera la respuesta de la API y se convierte en un objeto JavaScript usando response.json().

            if (data.status === 200) { //Comprueba si el estado de la respuesta es 200, lo que indica éxito.
                const reply = data.data.reply; //Extrae la respuesta de la API (reply) desde el objeto data.
                outputText.innerHTML = `Comando reconocido: <strong><em>${reply}</em></strong>`; //Muestra el mensaje recibido de la API en la interfaz.
            } else {
                outputText.innerHTML = `Error en la respuesta de OpenAI: <strong><em>${data.message}</em></strong>`;
            } //Si el estado de la respuesta no es 200, muestra un mensaje de error con la información proporcionada por la API.
        } catch (error) { //Captura cualquier error que ocurra durante la ejecución del bloque try.
            console.error("Error al enviar el mensaje a la API:", error); //Muestra el error en la consola del navegador.
            outputText.innerHTML = `Error en el servidor: <strong><em>${error.message}</em></strong>`; //Muestra un mensaje de error en la interfaz con la descripción del problema.
        }
    }
};

// Evento que maneja errores en el reconocimiento de voz
recognition.onerror = (event) => {
    console.error("Error en el reconocimiento:", event.error);

    // Manejo de errores específicos
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        alert("Error: El micrófono no tiene permisos o fue bloqueado.");
    } else if (event.error === "network") {
        alert("Error: Problema de conexión con el servicio de reconocimiento de voz.");
    }

    recognition.stop(); // Detiene el reconocimiento en caso de error
    startBtn.disabled = false; // Habilita nuevamente el botón
};

// Evento que se activa cuando el reconocimiento de voz finaliza
recognition.onend = () => {
    if (!stoppedManually) {
        // Mensaje indicando que el reconocimiento se detuvo inesperadamente
        msgText.innerHTML = "El reconocimiento de voz se detuvo inesperadamente<br>Habla nuevamente para continuar...";
        recognition.start(); // Reinicia automáticamente el reconocimiento
    }
};
});
