(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Preserve native details semantics, including keyboard activation.
  document.querySelectorAll('details.session').forEach(details => {
    const summary = details.querySelector('summary');
    const content = details.querySelector('.session-detail');
    let animation = null;
    let contentAnimation = null;
    let targetOpen = false;
    summary.addEventListener('click', event => {
      if (reduced.matches || !details.animate) return;
      event.preventDefault();
      const startHeight = details.getBoundingClientRect().height;
      targetOpen = animation ? !targetOpen : !details.open;
      if (animation) animation.cancel();
      if (contentAnimation) contentAnimation.cancel();
      details.style.height = `${startHeight}px`;
      details.style.overflow = 'hidden';
      details.open = true;
      const border = parseFloat(getComputedStyle(details).borderTopWidth) || 0;
      const endHeight = summary.getBoundingClientRect().height + border +
        (targetOpen ? content.getBoundingClientRect().height : 0);
      contentAnimation = content.animate(
        { opacity: targetOpen ? [0, 1] : [1, 0] },
        { duration: targetOpen ? 280 : 180, easing: 'ease-out', fill: 'forwards' }
      );
      animation = details.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration: 400, easing: 'cubic-bezier(.19,1,.22,1)' }
      );
      const current = animation;
      current.onfinish = () => {
        if (animation !== current) return;
        details.open = targetOpen;
        details.style.height = '';
        details.style.overflow = '';
        contentAnimation.cancel();
        contentAnimation = null;
        animation = null;
      };
    });
  });

  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-waiting');
          entry.target.classList.add('reveal-arrived');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.classList.add('reveal-waiting');
        observer.observe(element);
      }
    });
  }
})();
