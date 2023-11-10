document.querySelectorAll(".cartButton").forEach(function (element) {
  element.addEventListener("click", function () {
  $(document).ready(function () {
    $("#loginSignupModal").addClass("show");
    $("#loginSignupModal").modal("show");
    
  }); })
  
});


    //delete product modal
    // document.querySelectorAll(".deleteProd").forEach(function (element) {
    //   element.addEventListener("click", function () {
    //   $(document).ready(function () {
    //     $("#productDelete").addClass("show");
    //     $("#productDelete").modal("show");
        
    //   }); })
      
    // });

    

function closeModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
}
//product view image changing functionality
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



//function for image zoom
function imageZoom(imgID, resultID) {
  var img, lens, result, cx, cy;
  img = document.getElementById(imgID);
  result = document.getElementById(resultID);
  /* Create lens: */
  lens = document.createElement("DIV");
  lens.setAttribute("class", "img-zoom-lens");
  /* Insert lens: */
  img.parentElement.insertBefore(lens, img);
  /* Calculate the ratio between result DIV and lens: */
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  /* Set background properties for the result DIV */
  result.style.backgroundImage = "url('" + img.src + "')";
  result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
  /* Execute a function when someone moves the cursor over the image, or the lens: */
  lens.addEventListener("mousemove", moveLens);
  img.addEventListener("mousemove", moveLens);
  /* And also for touch screens: */
  lens.addEventListener("touchmove", moveLens);
  img.addEventListener("touchmove", moveLens);
  function moveLens(e) {
    var pos, x, y;
    /* Prevent any other actions that may occur when moving over the image */
    e.preventDefault();
    /* Get the cursor's x and y positions: */
    pos = getCursorPos(e);
    /* Calculate the position of the lens: */
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);
    /* Prevent the lens from being positioned outside the image: */
    if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
    if (y < 0) {y = 0;}
    /* Set the position of the lens: */
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    /* Display what the lens "sees": */
    result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  }
  function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /* Get the x and y positions of the image: */
    a = img.getBoundingClientRect();
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /* Consider any page scrolling: */
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return {x : x, y : y};
  }
}
imageZoom("myimage", "myresult");


//add to cart functionalty
document.querySelectorAll(".addtoCartButton").forEach(function (button) {
  button.addEventListener("click", addtoCart)
})

async function addtoCart() {
  const prodId = this.getAttribute("data-product-id");
  const response = await fetch(`/api/addtoCart/${prodId}`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      // body: JSON.stringify(dataToSend)
  })
  if (!response.ok) {
      throw new Error("Failed to fetch data");
  }
  const data = await response.json()
  console.log(data.message);

}