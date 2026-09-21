// Selettore della tavola di design: cambia solo il materiale del Profilebar.
const profileThemes = document.querySelectorAll('[data-profile-theme]');
profileThemes.forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.dataset.profileTheme;
    document.querySelectorAll('.profile-veil').forEach(profile => {
      profile.classList.toggle('profile-veil--luna', theme === 'luna');
      profile.classList.toggle('profile-veil--eclipse', theme === 'eclipse');
    });
    profileThemes.forEach(option => {
      option.setAttribute('aria-pressed', String(option === button));
    });
  });
});
