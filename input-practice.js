(() => {
  const root = document.getElementById('input-practice');
  if (!root) return;
  const examples = {
    apple: { pinyin: 'pingguo', rows: [['苹果', 'apple'], ['苹果树', 'apple tree'], ['苹果汁', 'apple juice']] },
    coffee: { pinyin: 'kafei', rows: [['咖啡', 'coffee'], ['咖啡豆', 'coffee beans'], ['咖啡馆', 'café']] },
    study: { pinyin: 'xuexi', rows: [['学习', 'study'], ['学习者', 'learner'], ['学习方法', 'study method']] }
  };
  const pinyin = root.querySelector('#input-demo-pinyin');
  const chinese = root.querySelectorAll('[data-input-cn]');
  const english = root.querySelectorAll('[data-input-en]');
  const buttons = root.querySelectorAll('[data-input-example]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const example = examples[button.dataset.inputExample];
      if (!example) return;
      pinyin.textContent = example.pinyin;
      example.rows.forEach(([cn, en], index) => {
        chinese[index].textContent = cn;
        english[index].textContent = en;
      });
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  root.querySelector('.input-demo-switches').hidden = false;
})();
