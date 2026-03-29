package com.example.terraspoter.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Uploads a file to Cloudinary under the given folder.
     * Returns the secure HTTPS URL of the uploaded image.
     *
     * @param file   the multipart file to upload
     * @param folder e.g. "terraspotter/lands" or "terraspotter/completions"
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder",          folder,
                        "resource_type",   "image",
                        "transformation",  "q_auto,f_auto"   // auto quality + format
                )
        );
        return (String) result.get("secure_url");
    }

    /**
     * Deletes an image from Cloudinary by its public_id.
     * public_id is everything after the base URL, without the extension.
     * e.g. "terraspotter/lands/abc123"
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}