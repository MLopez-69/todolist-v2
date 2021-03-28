//select required element
const ulTag = document.querySelector("ul");

function element (totalPages, page);{
  let liTag ='';
  if(page > 1){
    liTag += '<li class="page-item"><a class="page-link" href="#">Previous</a></li>';
  }
  if(page < totalPages){
    liTag += '<li class="page-item"><a class="page-link" href="#">Next</a></li>';
  }
  ulTag.innerHTML =liTag;

}

element(20, 5); //calling above function with passing values
