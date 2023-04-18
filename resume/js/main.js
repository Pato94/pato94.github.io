const sections = document.querySelectorAll('section');
const links = document.querySelectorAll('.links a')

document.querySelectorAll('.resume-container').forEach(e => {
  e.addEventListener('scroll', (eve) => {
    console.log('scrolling')
    console.log(e.classList)
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight
      console.log(e.scrollTop)
      if (e.scrollTop > (sectionTop - sectionHeight / 3)) {
        current = section.getAttribute('id');
      }
    })
    links.forEach(l => {
      l.classList.remove('active');
      if (l.classList.contains(current)) {
        l.classList.add('active');
      }
    })
  });
})
