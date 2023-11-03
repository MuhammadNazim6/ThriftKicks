document.getElementById("cartButton").addEventListener("click", function () {
  $(document).ready(function () {
    $("#loginSignupModal").addClass("show");
    $("#loginSignupModal").modal("show");
  });
});


//product view image cganging functionality
const button1 = document.getElementById('button1')
const button2 = document.getElementById('button2')
const button3 = document.getElementById('button3')
const image1 = document.getElementById('image1')
const image2 = document.getElementById('image2')
const image3 = document.getElementById('image3')

const zimage1 = document.getElementById('zimage1')
const zimage2 = document.getElementById('zimage2')
const zimage3 = document.getElementById('zimage3')

image2.style.display = 'none';
image3.style.display = 'none';


button1.addEventListener('click',function(){
    image1.style.display = 'block';
    image2.style.display = 'none';
    image3.style.display = 'none';

    zimage1.style.display = 'block';
    zimage2.style.display = 'none';
    zimage3.style.display = 'none';
})
button2.addEventListener('click',function(){
    image1.style.display = 'none';
    image2.style.display = 'block';
    image3.style.display = 'none';

    zimage1.style.display = 'none';
    zimage2.style.display = 'block';
    zimage3.style.display = 'none';
})
button3.addEventListener('click',function(){
    image1.style.display = 'none';
    image2.style.display = 'none';
    image3.style.display = 'block';

    zimage1.style.display = 'none';
    zimage2.style.display = 'none';
    zimage3.style.display = 'block';
})


//


// Apply zoom effect to all elements with the 'zoomable-image' class
// $('.zoomable-image').each(function() {
//   var $element = $(this);
//   var zoomInstance = $element.zoom(3);
//   zoomInstance.setZoom(20);
// });


