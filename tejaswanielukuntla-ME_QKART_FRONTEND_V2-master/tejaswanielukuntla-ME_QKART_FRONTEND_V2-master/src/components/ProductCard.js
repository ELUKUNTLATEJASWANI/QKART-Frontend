import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia component="img" image={product.image} alt={product.name0} height="140"/>
      <CardContent>
        <Typography>{product.name}</Typography>
        <Typography>${product.cost}</Typography>
        <Rating 
        precision={.5}
        readOnly
        value={product.rating}/>
      </CardContent>
      <CardActions>
          <Button className="card-button"
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCartOutlined/>}
          onClick={handleAddToCart}
          >
          ADD TO CART
          </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
