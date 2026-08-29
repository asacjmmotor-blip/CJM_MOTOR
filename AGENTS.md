# Workspace Guidelines: CJM Motor (Sistem Informasi Service Bengkel Motor)

## 📌 Development Philosophy: Ponytail Principles
Reference: https://github.com/DietrichGebert/ponytail
*"Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote."*

During all development steps of CJM Motor, strictly follow the **Ponytail Necessity Ladder**:

1. **YAGNI (You Ain't Gonna Need It)**: Do NOT add speculative features, unnecessary configuration layers, or redundant abstractions beyond what is specified in `PROJECT_SPEC_BENGKEL_MOTOR.md`, `DESIGN_BENGKEL_MOTOR.md`, and `DFD_UML_BENGKEL_MOTOR.md`.
2. **Reuse**: Re-use existing styling tokens, utility classes, backend helper functions, and database models.
3. **Stdlib & Native First**: Utilize native HTML5 elements (`<input type="date">`, `<select>`, native form validation), standard JavaScript APIs (`fetch`, `URLSearchParams`, DOM manipulation), and standard PHP functions before bringing in external JS plugins.
4. **Minimal & Clean Code**: Write concise, maintainable code. Keep files focused and avoid boilerplate bloat.
5. **Uncompromised Safety & Integrity**:
   - Strict validation on both Frontend (UX) and Backend (Security).
   - Prepared statements for database queries to prevent SQL Injection.
   - Output escaping to prevent XSS.
   - Sanitized license plate input (`B 1234 ABC`).
   - Read-only enforcement for CS endpoints.
