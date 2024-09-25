import fitz  

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

if __name__ == "__main__":
    pdf_path = "ncert.pdf"  
    text = extract_text_from_pdf(pdf_path)
    with open("ncert_text.txt", "w", encoding="utf-8") as f:
        f.write(text)
