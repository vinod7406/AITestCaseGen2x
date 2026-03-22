**Note from API QA Engineer:** 
The provided `API_Validation_Notes.md` stated that the POST request returned an inaccurate error message, but did **not** contain specific error codes, response schemas, or clear triggers. 

To strictly comply with your constraint to **"Use error codes from documentation"**, all missing codes and formats have been marked as `[Not Specified in Docs]`.

### API Error Handling Test Cases

| Test ID | Error Scenario | Trigger | Expected Code | Expected Response Format |
|---------|----------------|---------|---------------|--------------------------|
| **ERR-001** | Client Error (4xx) - Inaccurate Message | Send an invalid POST request | `[Not Specified in Docs]` | `[Not Specified in Docs]` (Must be safe, no stack traces) |
| **ERR-002** | Malformed Request | Send a malformed JSON payload on PUT | `[Not Specified in Docs]` | `[Not Specified in Docs]` (Must be safe, no stack traces) |
| **ERR-003** | Server Error (5xx) | Induce an internal server state via POST | `[Not Specified in Docs]` | `[Not Specified in Docs]` (Must be safe, no stack traces) |
| **ERR-004** | Timeout Handling | Trigger a timeout on a GET request | `[Not Specified in Docs]` | `[Not Specified in Docs]` (Must be safe, no stack traces) |
| **ERR-005** | Service Unavailable | Attempt to access DELETE while service is down | `[Not Specified in Docs]` | `[Not Specified in Docs]` (Must be safe, no stack traces) |
| **ERR-006** | Client Error (4xx) | Send an unauthorized DELETE request | `[Not Specified in Docs]` | `[Not Specified in Docs]` (Must be safe, no stack traces) |

---
**Documentation Required to Complete:**
To accurately finalize this test suite, please update your notes or provide the API schema that details:
1. **Specific 4xx/5xx HTTP Status Codes** returned by RESTful Booker.
2. The exact **JSON error response structure** (e.g., `{"error": "message details"}`).
3. The specific payload or parameter triggers that generate these errors.
