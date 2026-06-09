from PIL import Image
import os

def remove_background(img_path, output_path, threshold=245):
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
        
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # If RGB values are all above the threshold, make the pixel transparent
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Successfully saved transparent image to {output_path}")

if __name__ == "__main__":
    # Process the partnership image in the public folder
    remove_background("public/partnership.png", "public/partnership.png", threshold=245)
