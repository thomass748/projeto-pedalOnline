const botao = document.getElementById('meuBotao');

let mediaRecorder;
let gravacaoChunks = [];
let audioPlayer = null;

// Controla o estado atual: 'inicial', 'gravando' ou 'tocando'
let estado = 'inicial';

botao.addEventListener('click', async () => {
    
    // ESTADO 1: Iniciar gravação
    if (estado === 'inicial') {
        try {
            // Solicita permissão para acessar o microfone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorder = new MediaRecorder(stream);
            gravacaoChunks = [];

            // Guarda os pedaços do áudio à medida que são capturados
            mediaRecorder.ondataavailable = (event) => {
                gravacaoChunks.push(event.data);
            };

            // O que fazer quando a gravação for interrompida
            mediaRecorder.onstop = () => {
                // Junta os pedaços gravados em um único arquivo de áudio na memória
                const blobAudio = new Blob(gravacaoChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blobAudio);

                // Cria o reprodutor e ativa o LOOP
                audioPlayer = new Audio(audioUrl);
                audioPlayer.loop = true;
                audioPlayer.play();

                // Desliga a luz/acesso ao microfone no navegador
                stream.getTracks().forEach(track => track.stop());
            };

            // Começa a gravar
            mediaRecorder.start();
            estado = 'gravando';

            // Atualiza o visual do botão
            botao.textContent = '🔴 Gravando... Clique para PARAR e TOCAR';
            botao.className = 'gravando';

        } catch (erro) {
            alert('Não foi possível acessar o microfone.');
            console.error(erro);
        }

    // ESTADO 2: Parar gravação e tocar som em loop
    } else if (estado === 'gravando') {
        mediaRecorder.stop(); // Dispara o 'onstop' configurado acima
        estado = 'tocando';

        // Atualiza o visual do botão
        botao.textContent = '🔊 Tocando em Loop! Clique para REINICIAR';
        botao.className = 'tocando';

    // ESTADO 3: Parar o som e resetar para o início
    } else if (estado === 'tocando') {
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        estado = 'inicial';

        // Restaura o visual do botão
        botao.textContent = '🎤 Clique para Começar a Gravar';
        botao.className = 'estado-inicial';
    }
});