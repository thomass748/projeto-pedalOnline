const botao = document.getElementById('meuBotao');
const bpmInput = document.getElementById('bpmInput');
const bolinhas = document.querySelectorAll('.bolinha');

let mediaRecorder;
let gravacaoChunks = [];
let audioPlayer = null;
let estado = 'inicial';

// Variáveis do Metrônomo
let intervalMetronomo = null;
let batidaAtual = 0;

// Função que faz o metrônomo rodar continuamente
function iniciarMetronomo() {
    if (intervalMetronomo) clearInterval(intervalMetronomo);

    const bpm = parseInt(bpmInput.value) || 120;
    const msPorBatida = (60 / bpm) * 1000;

    intervalMetronomo = setInterval(() => {
        // Apaga a luz de todas as bolinhas
        bolinhas.forEach(b => b.classList.remove('ativa'));

        // Acende apenas a bolinha do tempo atual
        bolinhas[batidaAtual].classList.add('ativa');

        // Avança para a próxima bolinha (0, 1, 2, 3 e volta pro 0)
        batidaAtual = (batidaAtual + 1) % 4;
    }, msPorBatida);
}

// Atualiza o metrônomo sempre que o usuário alterar o BPM
bpmInput.addEventListener('change', iniciarMetronomo);
bpmInput.addEventListener('input', iniciarMetronomo);

// Inicia o metrônomo assim que a página carrega
iniciarMetronomo();

// Lógica de gravação e reprodução do áudio
botao.addEventListener('click', async () => {
    
    if (estado === 'inicial') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorder = new MediaRecorder(stream);
            gravacaoChunks = [];

            mediaRecorder.ondataavailable = (e) => gravacaoChunks.push(e.data);

            mediaRecorder.onstop = () => {
                const blobAudio = new Blob(gravacaoChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blobAudio);

                audioPlayer = new Audio(audioUrl);
                audioPlayer.loop = true;
                audioPlayer.play();

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            estado = 'gravando';

            botao.textContent = '🔴 Gravando no tempo... Clique para TOCAR';
            botao.className = 'gravando';

        } catch (erro) {
            alert('Não foi possível acessar o microfone.');
        }

    } else if (estado === 'gravando') {
        mediaRecorder.stop();
        estado = 'tocando';

        botao.textContent = '🔊 Tocando em Loop! Clique para REINICIAR';
        botao.className = 'tocando';

    } else if (estado === 'tocando') {
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        estado = 'inicial';

        botao.textContent = '🎤 Clique para Começar a Gravar';
        botao.className = 'estado-inicial';
    }
});