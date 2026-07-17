# Third-party notices

Dự án này sử dụng (vendor) một phần mã nguồn của bên thứ ba. Toàn văn giấy phép được giữ lại dưới đây theo đúng yêu cầu của các giấy phép tương ứng.

---

## Vietnam 3D Map — hiệu ứng biển động (ocean water shader)

- Nguồn: https://github.com/lamngockhuong/vietnam-3d-map
- Tệp gốc: `src/components/map/Ocean.tsx`
- Sử dụng tại: `src/ocean3d.ts` (chuyển thể từ React Three Fiber sang Three.js thuần cho MapLibre custom layer; hai đoạn shader GLSL giữ gần như nguyên bản).

```
MIT License

Copyright (c) 2025 Lam Ngoc Khuong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Ghi chú về holetexvn/vietnam-3d-map

Mô hình landmark 3D trong `src/landmarks3d.ts` được **truyền cảm hứng thị giác** từ https://github.com/holetexvn/vietnam-3d-map nhưng **không sao chép mã hay asset** của repo đó (repo chưa có tệp LICENSE, mặc định là *all rights reserved*). Toàn bộ hình khối là mã gốc của dự án này. Đã mở issue xin làm rõ giấy phép: holetexvn/vietnam-3d-map#1.
