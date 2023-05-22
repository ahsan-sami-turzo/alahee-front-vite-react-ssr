import React from 'react';
import LazyLoad from 'react-lazyload';
import {
  calDiscountPercentage,
  calculateProductPriceAfterDiscount,
  capitalizeStr,
  capitalize_and_shorten_name
} from '../../utils/utils';

const file_url = import.meta.env.VITE_APP_FILE_URL;
const img_src = `${file_url}/upload/product/compressedProductImages`;

const ProductCardConditional = ({ product, customNewLabelCSSDesktop, customDiscountCSSDesktop, customNewLabelCSSMobile, customDiscountCSSMobile }) => {

  product['images'] = JSON.parse(product.image);
  product.slug = product.slug;

  return (
    <>
      <div className="card">
        <a href={`/productDetails/${product.slug}`}>
          <LazyLoad height={200}>
            <img
              className="card-img-top"
              src={`${img_src}/${product.home_image}`}
              // onMouseOver={(e) =>
              //   (e.currentTarget.src = `${img_src}/${product.images[1].imageName}`)
              // }
              // onMouseOut={(e) =>
              //   (e.currentTarget.src = `${img_src}/${product.home_image}`)
              // }
              alt={capitalizeStr(product.product_name)}
              title={capitalizeStr(product.product_name)}
            />
          </LazyLoad>
        </a>

        {/* desktop  */}
        <div className="d-none d-lg-block">
          {product.newProduct === 1 && (
            <span className={`${customNewLabelCSSDesktop}`}>New</span>
          )}

          {product.discountAmount != 0 && (
            <span className={`${customDiscountCSSDesktop}`}>
              {calDiscountPercentage(
                product.discountAmount,
                product.productPrice
              )}%
              {/* 0% */}
            </span>
          )}
        </div>

        {/* mobile */}
        <div className="d-block d-lg-none">
          {product.newProduct === 1 && (
            <span className={`${customNewLabelCSSMobile}`}>New</span>
          )}

          {product.discountAmount != 0 && (
            <span className={`${customDiscountCSSMobile}`}>
              {calDiscountPercentage(
                product.discountAmount,
                product.productPrice
              )}%
              {/* 0% */}
            </span>
          )}
        </div>

        <div className="card-body">
          <div className="text-center">
            <h1 className="card-title h6">
              <a href={`/productDetails/${product.slug}`}>
                <span className="text-primary">
                  {capitalize_and_shorten_name(product.product_name)}
                </span>
              </a>
            </h1>
            <p className="card-text">
              {/* ৳&nbsp;{product.productPrice - product.discountAmount}
              {product.discountAmount > 0 && (
                <span>৳&nbsp;{product.productPrice}</span>
              )} */}

              <span className={(calculateProductPriceAfterDiscount(product.productPrice, product.discountAmount) > 0 ? 'strikediag' : '')}>
                ৳&nbsp;{product.productPrice}
              </span>
              &nbsp;
              {calculateProductPriceAfterDiscount(product.productPrice, product.discountAmount) > 0 && (
                <span className='custom-cart-discount-font-size'>৳&nbsp;{calculateProductPriceAfterDiscount(product.productPrice, product.discountAmount)}</span>
              )}
            </p>
          </div>
        </div>
      </div>


      <style jsx="true">{`
        .custom-cart-title-font-size {
          font-size: 0.85rem;
        }

        .custom-cart-discount-font-size {
          font-size: 1.5 rem;
          font-weight: bold;
        }

        .custom-cart-text-font-size {
          font-size: 0.75rem;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .capitalizeStr {
          text-transform: capitalize;
        }
      `}</style>

    </>
  );
};

export default ProductCardConditional;
