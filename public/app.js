const output = document.getElementById('output');
const status = document.getElementById('status');
const env = document.getElementById('env');

async function run(action, extra = {}) {
  status.textContent = 'A executar…';
  output.textContent = '';
  const started = performance.now();
  try {
    const qs = new URLSearchParams({ action, env: env.value, ...extra });
    const response = await fetch(`/api/bridgecard?${qs}`);
    const data = await response.json();
    status.textContent = `${response.status} · ${Math.round(performance.now() - started)} ms`;
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    status.textContent = 'Erro';
    output.textContent = error.stack || error.message;
  }
}

document.getElementById('health').onclick = () => run('health');

document.querySelectorAll('[data-action]').forEach(button => {
  button.onclick = () => {
    const action = button.dataset.action;
    if (action === 'card-details' || action === 'card-balance') {
      const card_id = document.getElementById('cardId').value.trim();
      if (!card_id) return alert('Informe o Card ID.');
      return run(action, { card_id });
    }
    if (action === 'card-transactions') {
      const card_id = document.getElementById('txCardId').value.trim();
      if (!card_id) return alert('Informe o Card ID.');
      return run(action, { card_id });
    }
    run(action);
  };
});
