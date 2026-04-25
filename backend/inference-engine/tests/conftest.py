import sys
import os

_base = os.path.dirname(__file__)
_engine = os.path.join(_base, "..")

# Add math/ and tagging/ subdirs to path without shadowing stdlib math
sys.path.insert(0, os.path.join(_engine, "math"))
sys.path.insert(0, os.path.join(_engine, "tagging"))
