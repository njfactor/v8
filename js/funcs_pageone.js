function begin()
{
	server_url = details[4];
	var x=checkIfPresent(details[1]);
	if(x>=0)//present
	{
      alert('This item is already present in your cart.');
      changeQtyRescan(x);																					//to change to increment instead of replace
	}
	else//not present
	{
		//take quantity input
		var tempqt=takeQuantity();
		if(tempqt!=-1){
			temprod=new product(details[3],details[1],parseFloat(details[2]), parseInt(tempqt),parseFloat(details[2]));
			add_object(temprod);
			getDetails(temprod);
			}
	}
}
//end

function updateAllConstantsDisplay()
{
	$("#total_price").text(total_price.toFixed(2));
	$("#total_items").text(cart_top);
}

function changeQtyRescan(pos)
{
	//cart[pos].qty = parseInt(cart[pos].qty); 
	cart[pos].qty++; 
	cart[pos].subTotal=calc_subtotal(cart[pos].mallPrice,cart[pos].qty);
	total_price+=cart[pos].mallPrice;
	
	changeQtyRescanDisplay(pos);
	updateAllConstantsDisplay();

}

function changeQtyRescanDisplay(pos){
		alert(cart[pos].qty);
		$("#qt__" + cart[pos].pdId).val(cart[pos].qty+"");
		$("#sTotal" + cart[pos].pdId).text(cart[pos].subTotal.toFixed(2));
}


//Server request to get product details
function getDetails(tempprod)
{
/* Handle errors if product scanned is not in server database. To do this we can use a flag attribute in product.*/
//    alert('in get details');//to be removed
	event.preventDefault();

	var finurl= getQueryString(server_url,tempprod.pdId);
	
	var jqxhr= $.get( finurl, function( data ) {

//	alert('Server has sent the data');	
	var i=checkIfPresent(tempprod.pdId);
	if(i>=0){
	{
		total_price-=cart[i].subTotal;
		data.qty=cart[i].qty;
		data.subTotal=calc_subtotal(data.qty,data.mallPrice);
		cart[i] = data;
		total_price+=cart[i].subTotal;
		alert('The mall is providing ' + data.offer + ' on ' + data.pdName + '.');	
	}
	{
		$("#img" + cart[i].pdId).attr("src",cart[i].imgURL);
		$("#qt__" + cart[i].pdId).attr("value",cart[i].qty);
		$("#sTotal" + cart[i].pdId).text(cart[i].subTotal.toFixed(2));
		$("#mPrice" + cart[i].pdId).text(cart[i].mallPrice.toFixed(2));
	}	
		updateAllConstantsDisplay();
		
	}
	},"json");
	
	jqxhr.fail(function()
		{
			alert('Sorry!\nThe additional information on '+ tempprod.name + 'could not be retrieved.');
		});
	//var pdImg=document.getElementById('img' + cart[i].pdId + '');
}
//end

//to create the query string
function getQueryString (url,pid)
{	
return  url+"?method=getProductDetails&pID="+pid;	
}
//end


//Constructor for product class
function product(pdName,pdId,mallPrice,qty,mrp,discount,offer,pdDescription,imgURL)
{
	this.pdName = pdName;
	this.pdId = pdId;
	this.mallPrice = mallPrice;
	this.qty=qty;
    this.subTotal=mallPrice*qty;
	this.mrp = mrp;
	this.discount = discount;
	this.offer = offer;
	this.pdDescription = pdDescription;
	this.imgURL = imgURL;
}


//to remove the product object from the cart array
function remove_object(id)
{
	var i=checkIfPresent(id);
	
	if(i>=0){
    total_price-=cart[i].subTotal;//update the total price 
	cart_top-=1;//update the cart index
	
	var temp_arr_start=cart.splice(0,i+1);
	temp_arr_start.pop();
	cart=temp_arr_start.concat(cart);
  
	removeFromDisplay(id);
	updateAllConstantsDisplay();
	disableEnablePayLink();}
	else
	{
		alert("item not present in the cart");
	}
}
//end
function removeFromDisplay(id)
{
	$("#"+id).remove();
}

function convert(x)
{
   return parseFloat(x);
}


//to calculate the item's subtotal
function calc_subtotal(mallPrice,qty)
{
  return mallPrice*qty;
}
//end


//to check if the item is already present in the cart array. If present return the pos of product else return -1
function checkIfPresent(id)
{
  var i;
  for(i=0;i<cart_top;i++)
 {
    if(cart[i].pdId==id)
       return i;
 }
  return -1;
}
//end

function add_object(tempprod)
{
	cart.push(tempprod);
	
	cart_top++;
	total_price+=tempprod.subTotal;
	
	addToDisplay(tempprod);
	
	updateAllConstantsDisplay();
	disableEnablePayLink();
}

function addToDisplay(tempprod)
{
	var $ele=$('<div data-role="collapsible" data-collapsed="false" id="'+tempprod.pdId+'"><h1>'+tempprod.pdName+'<a href="#" class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext" onclick="remove_object(this.id)" id = "'+tempprod.pdId+'" style="float: right;"></a></h1><div class="ui-grid-b"><div class="ui-block-a"><span><img src="warning.png" height = "70px"/ id="img' + tempprod.pdId + '"></span></div><div class="ui-block-b"><span> <strong>Name:'+tempprod.pdName+'<br>Id:'+tempprod.pdId+' </strong><br><strong>Price: <span  id="mPrice' + tempprod.pdId + '">'+tempprod.mallPrice.toFixed(2)+'</span> </strong></span></div><div class="ui-block-c"><div class="ui-block-c"><div class="myInput" id = "myInput"><button class="myInputButtonMinus" id="minus__'+tempprod.pdId+'" onclick="minus_click(this.id)" data-icon="minus">-</button><input type="number" class="myInputBox" id="qt__'+tempprod.pdId+'" onkeyup="key_up(this.id)" onfocusout="focus_out(this.id)"  value="'+tempprod.qty+'" maxlength=""><button class="myInputButtonPlus" id="plus__'+tempprod.pdId+'" onclick="plus_click(this.id)" >+</button></div><div class = "ui-block-c"> <strong>Subtotal: <span id="sTotal' + tempprod.pdId + '">'+tempprod.subTotal.toFixed(2)+'</span></strong></div></div></div>').appendTo(document.getElementById('wrapper'));
	$ele.collapsible();
}


function changeQuantity(qtId,qtValue)
{
	var actualId = qtId.split("__").pop();
	var i=checkIfPresent(actualId);
	 actualValue = parseInt(qtValue);
    
   var temp_subTotal=calc_subtotal(actualValue,cart[i].mallPrice);//calculate the subtotal for now
	
	cart[i].qty=actualValue;//replace the qty;
	total_price=total_price-(cart[i].subTotal);//decrement the existing item's subtotal
    cart[i].subTotal=temp_subTotal;//update the subtotal;
	total_price+=temp_subTotal;//update the total price
	
	$("#sTotal" + cart[i].pdId).text(cart[i].subTotal.toFixed(2));
	
	updateAllConstantsDisplay();
}

 function disableEnablePayLink()
{
       if(cart_top != 0)
       {
               $("#payButton").removeClass('ui-disabled');   
       }
       else
       {
               $("#payButton").addClass('ui-disabled');                
       }
}

function deleteAll()
{
cart=[];//empty the cart array

$("#wrapper").text("");//empty the display
total_price=0;
cart_top=0;

updateAllConstantsDisplay();
disableEnablePayLink();
}


function firstFunction()
{
	cartID = parseInt(Math.random() * 1000000);
	disableEnablePayLink();
	updateAllConstantsDisplay();
}


//to splice the information.....called after scanner
function splitter(info)
{
	details=info.split(separator);
}
//end

function checkValidQR(tex){
	if(tex=="")
		return false;
	splitter(tex);
	if(details.length<3)
		return false;
	if(details[0]!=appUniqueKey)
		return false;
	if(details[1]=="")
		return false;
	if(parseFloat(details[2])=="NaN")
		return false;
	return true;
}

//returns the quantity input by user, returns -1 in case user doesn't wants to add item
function takeQuantity()
{
	var qty = prompt('Enter the number of prducts you wish to buy: \n',"1");
	if(qty==null)
	return -1;
	qty=parseFloat(qty);
	while(isNaN(qty)||(qty%1!=0)||qty<0)
		{
		alert("Please enter valid quantity");
		var qty = prompt('Enter the number of prducts you wish to buy: \n',"1");
		if(qty==null)
			return -1;
		qty=parseFloat(qty);
		}
	if(qty==0)
		return -1;
	return qty;
	
}