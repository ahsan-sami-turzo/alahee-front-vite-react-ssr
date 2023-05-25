?php
$https = 'https://alahee.com:5001/api/productDetails/'. $_GET['id'];
$data = file_get_contents($https);
$result = json_decode($data, true);
$url = "https://alahee.com/productDetails/". $result['slug'];
$product_name = $result['product_name'];
$description = json_decode($result['product_full_description'], true)[0]['description'];
$image = json_decode($result['image'], true)[0]['imageName'];
$image = 'https://admin.alahee.com/upload/product/compressedProductImages/'. $image;
?>
<!doctype html>
<html lang="en">

<head>
    <title>Your Website Title</title>
    <meta property="og:url" content="<?php echo $url ?>" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="<?php echo $product_name ?>" />
    <meta property="og:description" content="<?php echo $description ?>" />
    <meta property="og:image" content="<?php echo $image ?>" />
</head>

<body>
    <div id="fb-root"></div>
    <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v16.0&appId=542825373971492&autoLogAppEvents=1" nonce="O9N6agHj"></script>
    <!-- <a href="https://www.facebook.com/sharer/sharer.php?u=https://5ddb-103-177-246-186.ngrok-free.app/facebook.php?id=<?php echo $_GET['id'] ?>&rand=<?php echo rand() ?>" target="_blank">facebook</a> -->
</body>

</html> 