import os
import json
import uuid
import threading
from datetime import datetime
from typing import Dict, Any, List, Optional
from ..models.schemas import User, LostItem, FoundItem, Claim, Notification, AuditLog, CampusLocation
from .seed_data import get_initial_seed_data

STORE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "traceback_store.json")

class Database:
    _instance = None
    _lock = threading.RLock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(Database, cls).__new__(cls)
                    cls._instance._init_store()
        return cls._instance

    def _init_store(self):
        self.data: Dict[str, Any] = {}
        if os.path.exists(STORE_PATH):
            try:
                with open(STORE_PATH, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
                    print(f"[Database] Loaded existing database from {STORE_PATH}")
                    return
            except Exception as e:
                print(f"[Database] Error reading {STORE_PATH}: {e}, re-seeding...")

        self.reset_to_seed()

    def reset_to_seed(self):
        with self._lock:
            self.data = get_initial_seed_data()
            self._save()
            print("[Database] Initialized with fresh demo seed data.")

    def _save(self):
        os.makedirs(os.path.dirname(STORE_PATH), exist_ok=True)
        try:
            with open(STORE_PATH, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Database] Save error: {e}")

    # Users
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        for u in self.data.get("users", []):
            if u["id"] == user_id:
                return u
        return None

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        for u in self.data.get("users", []):
            if u["email"].strip().lower() == email_clean:
                return u
        return None

    def create_user(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            if not user_dict.get("id"):
                user_dict["id"] = f"usr_{uuid.uuid4().hex[:8]}"
            user_dict["created_at"] = datetime.utcnow().isoformat()
            self.data.setdefault("users", []).append(user_dict)
            self._save()
            return user_dict

    # Lost Items
    def get_lost_items(self, current_user_id: Optional[str] = None, role: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self.data.get("lost_items", [])
        result = []
        for it in items:
            it_copy = dict(it)
            # Privacy guard: redact private_clue if not owner and not staff/admin
            is_owner = (current_user_id and it.get("user_id") == current_user_id)
            is_staff = (role in ["staff", "admin"])
            if not (is_owner or is_staff):
                it_copy["private_clue"] = None
            result.append(it_copy)
        return result

    def get_lost_item(self, item_id: str, current_user_id: Optional[str] = None, role: Optional[str] = None) -> Optional[Dict[str, Any]]:
        for it in self.data.get("lost_items", []):
            if it["id"] == item_id:
                it_copy = dict(it)
                is_owner = (current_user_id and it.get("user_id") == current_user_id)
                is_staff = (role in ["staff", "admin"])
                if not (is_owner or is_staff):
                    it_copy["private_clue"] = None
                return it_copy
        return None

    def create_lost_item(self, item_dict: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            if not item_dict.get("id"):
                item_dict["id"] = f"lost_{uuid.uuid4().hex[:8]}"
            item_dict["created_at"] = datetime.utcnow().isoformat()
            self.data.setdefault("lost_items", []).append(item_dict)
            self._increment_location_loss(item_dict.get("location"))
            self._save()
            return item_dict

    def update_lost_item(self, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            for i, it in enumerate(self.data.get("lost_items", [])):
                if it["id"] == item_id:
                    self.data["lost_items"][i].update(updates)
                    self._save()
                    return self.data["lost_items"][i]
        return None

    # Found Items
    def get_found_items(self) -> List[Dict[str, Any]]:
        return self.data.get("found_items", [])

    def get_found_item(self, item_id: str) -> Optional[Dict[str, Any]]:
        for it in self.data.get("found_items", []):
            if it["id"] == item_id:
                return it
        return None

    def create_found_item(self, item_dict: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            if not item_dict.get("id"):
                item_dict["id"] = f"found_{uuid.uuid4().hex[:8]}"
            item_dict["created_at"] = datetime.utcnow().isoformat()
            self.data.setdefault("found_items", []).append(item_dict)
            self._increment_location_found(item_dict.get("location"))
            self._save()
            return item_dict

    def update_found_item(self, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            for i, it in enumerate(self.data.get("found_items", [])):
                if it["id"] == item_id:
                    self.data["found_items"][i].update(updates)
                    self._save()
                    return self.data["found_items"][i]
        return None

    # Claims
    def get_claims(self, claimant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        claims = self.data.get("claims", [])
        if claimant_id:
            return [c for c in claims if c.get("claimant_id") == claimant_id]
        return claims

    def get_claim(self, claim_id: str) -> Optional[Dict[str, Any]]:
        for c in self.data.get("claims", []):
            if c["id"] == claim_id:
                return c
        return None

    def create_claim(self, claim_dict: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            if not claim_dict.get("id"):
                claim_dict["id"] = f"claim_{uuid.uuid4().hex[:8]}"
            claim_dict["created_at"] = datetime.utcnow().isoformat()
            self.data.setdefault("claims", []).append(claim_dict)
            # Update target found item status to claim_pending
            self.update_found_item(claim_dict.get("found_item_id"), {"status": "claim_pending"})
            if claim_dict.get("lost_item_id"):
                self.update_lost_item(claim_dict.get("lost_item_id"), {"status": "claim_pending"})
            self._save()
            return claim_dict

    def update_claim(self, claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            for i, c in enumerate(self.data.get("claims", [])):
                if c["id"] == claim_id:
                    self.data["claims"][i].update(updates)
                    self._save()
                    return self.data["claims"][i]
        return None

    # Notifications
    def get_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        notifs = [n for n in self.data.get("notifications", []) if n.get("user_id") == user_id]
        notifs.sort(key=lambda n: n.get("created_at", ""), reverse=True)
        return notifs

    def create_notification(self, notif_dict: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            if not notif_dict.get("id"):
                notif_dict["id"] = f"notif_{uuid.uuid4().hex[:8]}"
            notif_dict["created_at"] = datetime.utcnow().isoformat()
            if "is_read" not in notif_dict:
                notif_dict["is_read"] = False
            self.data.setdefault("notifications", []).append(notif_dict)
            self._save()
            return notif_dict

    def mark_notification_read(self, notif_id: str, user_id: str) -> bool:
        with self._lock:
            for n in self.data.get("notifications", []):
                if n["id"] == notif_id and n.get("user_id") == user_id:
                    n["is_read"] = True
                    self._save()
                    return True
        return False

    def mark_all_notifications_read(self, user_id: str) -> int:
        with self._lock:
            count = 0
            for n in self.data.get("notifications", []):
                if n.get("user_id") == user_id and not n.get("is_read"):
                    n["is_read"] = True
                    count += 1
            if count > 0:
                self._save()
            return count

    # Audit Logs
    def get_audit_logs(self) -> List[Dict[str, Any]]:
        logs = list(self.data.get("audit_logs", []))
        logs.sort(key=lambda l: l.get("timestamp", ""), reverse=True)
        return logs

    def create_audit_log(
        self,
        actor_id: str,
        actor_name: str,
        actor_role: str,
        action: str,
        target_type: str,
        target_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        with self._lock:
            log_item = {
                "id": f"audit_{uuid.uuid4().hex[:8]}",
                "actor_id": actor_id,
                "actor_name": actor_name,
                "actor_role": actor_role,
                "action": action,
                "target_type": target_type,
                "target_id": target_id,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": metadata or {}
            }
            self.data.setdefault("audit_logs", []).append(log_item)
            self._save()
            return log_item

    # Campus Locations & Heatmap
    def get_campus_locations(self) -> List[Dict[str, Any]]:
        return self.data.get("campus_locations", [])

    def _increment_location_loss(self, loc_name: Optional[str]):
        if not loc_name:
            return
        loc_clean = loc_name.lower()
        for loc in self.data.get("campus_locations", []):
            if loc["name"].lower() in loc_clean or loc_clean in loc["name"].lower():
                loc["loss_count"] = loc.get("loss_count", 0) + 1
                break

    def _increment_location_found(self, loc_name: Optional[str]):
        if not loc_name:
            return
        loc_clean = loc_name.lower()
        for loc in self.data.get("campus_locations", []):
            if loc["name"].lower() in loc_clean or loc_clean in loc["name"].lower():
                loc["found_count"] = loc.get("found_count", 0) + 1
                break

db = Database()
