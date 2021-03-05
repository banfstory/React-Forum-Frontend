export const displayFlashMessage = (message, setFlash, setFlashContent) => {
  setFlashContent(message);
  setFlash(true);
  setTimeout(() => {
      setFlashContent('');
      setFlash(false);
	}, 9000);
}