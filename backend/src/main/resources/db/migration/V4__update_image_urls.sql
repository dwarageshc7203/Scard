UPDATE profile SET custom_image_url = REPLACE(custom_image_url, '/uploads/', '/api/images/') WHERE custom_image_url LIKE '/uploads/%';
