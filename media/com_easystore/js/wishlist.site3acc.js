document.addEventListener('alpine:init',()=>{Alpine.data('easyStoreWishlist',()=>({isLoading:false,addToWishList(data){const{productId,hasText=true,hasIcon=true}=data;if(productId){const url=`${Joomla.getOptions('easystore.base')}/index.php?option=com_easystore&task=wishlist.addOrRemoveWishList`;this.hasIcon=hasIcon;this.hasText=hasText;this.wishListIcon=this.$refs.easystoreWishlistIcon;this.wishListText=this.$refs.easystoreWishlistText;this.btn=this.$el;this.action=this.btn.classList.contains('active')?'remove':'add';const formData=new FormData();formData.append('productId',productId);formData.append('action',this.action);this.sendRequest(url,formData);}},async sendRequest(url,formData){const uri=new URL(window.location);formData.append('return',uri.href);this.isLoading=true;try{const response=await Joomla.request({url:url,data:formData,method:'POST',promise:true,});const responseData=JSON.parse(response.response);this.btn.classList.toggle('active',this.action==='add');if(this.hasIcon)this.wishListIcon.innerHTML=responseData.data.icon;if(this.hasText)this.wishListText.innerHTML=responseData.data.text;}catch(error){if(error.status===303){const response=JSON.parse(error.response);this.isLoading=false;if(response.data?.redirect){window.location.href=response.data.redirect;return;}}
Joomla.renderMessages(Joomla.ajaxErrorsMessages(error));}
this.isLoading=false;},}));});