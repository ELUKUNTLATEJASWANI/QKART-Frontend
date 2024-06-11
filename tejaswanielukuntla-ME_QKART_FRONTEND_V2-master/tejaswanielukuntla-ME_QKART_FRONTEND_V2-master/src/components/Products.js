import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import ProductCard from "./ProductCard"
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import Cart, { generateCartItemsFrom } from "./Cart";
import { LineAxisOutlined } from "@mui/icons-material";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const[loading,setLoading]=useState(true);
  const[products,setProducts]=useState([])
  const [filteredProducts,setFilteredProducts]=useState([])
  const [searchText,setSearchText]=useState('')
  const [timer,setTimer]=useState(null);
  const [items,setItems]=useState([]);
  const token=localStorage.getItem('token');
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
   try{
    let res=await axios.get(`${config.endpoint}/products`)
    setProducts(res.data);
    setFilteredProducts(res.data);
   }catch(e){
    enqueueSnackbar(
      e.response.data.message,
      {variant:"error"}
    )

   }finally{
    setLoading(false)
   }
  };
  const fetchCart= async(token)=>{
    if (!token) return;
    try{
     const response=await axios.get(`${config.endpoint}/cart`,{
      headers:{
        Authorization:`Bearer ${token}`,
      }
     });
     return response.data;
    }
    catch(e){
        enqueueSnackbar(
          'Could not fetch card details. Check that the backend is running, reachable and returns valid JSON.',
          {variant:"error"}
        ); 
      }
    }
  
  // useEffect(()=>{
  //   const onLoadHandler=async ()=>{
  //      const productsData=await performAPICall();
  //      const cartData=await fetchCart('token')
  //      const cartDetails=  generateCartItemsFrom(cartData,productsData);
  //      setItems(cartDetails);
  //   }
  //   onLoadHandler();
   
  // }, []);
  useEffect(()=>{
        performAPICall();
 
   
  }, []);
  // token=localStorage.getItem("token")
  useEffect(()=>{
    const onLoadHandler=async ()=>{
       const cartData=await fetchCart(token);
       const cartDetails=  generateCartItemsFrom(cartData,products);
       setItems(cartDetails);
    }
    onLoadHandler();
   
  }, [token,products]);



  const isItemInCart=(items,productId)=>{
     const isExist= items.find((item)=>item.productId===productId);
     return !!isExist;
  }

  const updateCartItems=(cartData,Products)=>{
    const cartItems =generateCartItemsFrom(cartData,products);
    setItems(cartItems);
  }

  const addToCart= async(
    token,
    items,
    products,
    productId,
    qty,
    options={preventDuplicate:false}
  )=>{
  if(!token) {
    enqueueSnackbar(
      'Login to add an item to the Cart',
      {variant:"Warning"}
    ); 
    return;
  }
  if(options.preventDuplicate && isItemInCart(items,productId)){
    enqueueSnackbar(
      'Item already in cart. Use the cart sidebar to update quantity or remove item.',
      {variant:"Warning"}
    ); 
    return;
  }
  try{
  const response =await axios.post(`${config.endpoint}/cart`,{
    productId:productId,
    qty:qty
  },{
    headers:{
      Authorization:`Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  updateCartItems(response.data,products);
  // }catch(e){
  //   if(e.response){
  //     enqueueSnackbar(e.response.data.message,{variant:'error'});
  //     return null;
  //   }
}catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      enqueueSnackbar(e.response.data.message, { variant: 'error' });
    }
  else{
      enqueueSnackbar(
        'Could not add items to the Cart . Check that the backend is running, reachable and returns valid JSON.',
        {variant:"error"}
      ); 
  }
  }

  }
  

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try{
   let res= await axios.get(`${config.endpoint}/products/search?value=${text}`)
   setFilteredProducts(res.data)
    }catch(e){
      if(e.response){
        if(e.response.status===404){
          setFilteredProducts([])
        }else{
          enqueueSnackbar(e.response.data.message,{
            variant:'error'
          })
          setFilteredProducts([...products]) 
        }
      }else{
        enqueueSnackbar(
          'Could not fetch products. Check that the backend is running, reachable and returns valid JSON.',
          {variant:"error"}
        ); 
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {

    if(debounceTimeout){
    clearTimeout(debounceTimeout)
    }
    let timerId=setTimeout(()=>{
      performSearch(event.target.value)
    },500)
    setTimer(timerId)
  };

const getGridItems=()=>{
  console.log('>',filteredProducts,'<')
return (filteredProducts.length ? filteredProducts.map(product=>( <Grid item xs={2} md={3}  key ={product._id}> 
  <ProductCard
   product={product}
   handleAddToCart={async()=>{
    await addToCart(
      token,
      items,
      products,
      product._id,
      1,
      {
        preventDuplicate:true
      }
    )
   }}
   />
   </Grid>)) :  <Box className="loading">
          <SentimentDissatisfied color="action"/>
          <h4>No Products found</h4>
          </Box>)

}


  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
        className="search-desktop"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        value={searchText}
        onChange={(e)=>{
          setSearchText(e.target.value)
          debounceSearch(e,timer)
        }}

      />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        value={searchText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e)=>{
          setSearchText(e.target.value)
          debounceSearch(e,timer)
        }}
      />
       <Grid container >
         <Grid item
         xs={12}
         md={token&& products.length ? 9:12}
         className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
           <Grid container spacing={1} margin={2}>

        { loading ? <Box className="loading">
          <CircularProgress/>
          <h4>Loading Products...</h4>
          </Box>:getGridItems(filteredProducts)}
           </Grid>
         </Grid>
         {token && (<Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart
          products={products}
          items={items}
          handleQuantity={addToCart} 
           hasCheckoutButton={true}
          />
         </Grid>)}
       </Grid>
      <Footer />
    </div>
  );
};

export default Products;
