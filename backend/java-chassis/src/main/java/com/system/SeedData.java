package com.system;

import com.system.managers.LibraryIndexer;
import com.system.models.PoliFigure;
import com.system.models.PoliVector;
import java.util.Arrays;

public class SeedData {

    public static void seed(LibraryIndexer indexer) {
        add(indexer, "bd-fl19",   "Byron Donalds",             "R", "U.S. House",   new float[]{3,4,3,5,5,5,4,5,5,2,5,5,5,4,4,5,5,5,5,3});
        add(indexer, "jc-fl15",   "Jay Collins",               "R", "State Senate", new float[]{3,3,3,3,4,4,3,4,3,3,4,4,3,4,4,4,4,4,4,4});
        add(indexer, "am-flag",   "Ashley Moody",              "R", "Statewide",    new float[]{4,3,3,3,4,5,5,4,4,2,4,5,2,4,3,4,3,5,4,4});
        add(indexer, "rs-flgov",  "Ron DeSantis",              "R", "Governor",     new float[]{4,4,4,3,5,5,5,4,3,2,5,5,2,4,3,4,4,5,4,5});
        add(indexer, "rs-flsen",  "Rick Scott",                "R", "U.S. Senate",  new float[]{5,5,5,4,4,4,4,4,3,3,4,5,3,4,3,4,5,4,4,4});
        add(indexer, "mr-flsen",  "Marco Rubio",               "R", "U.S. Senate",  new float[]{4,4,4,3,4,4,5,4,3,3,5,5,3,3,3,4,4,5,3,4});
        add(indexer, "mw-fl23",   "Debbie Wasserman Schultz",  "D", "U.S. House",   new float[]{2,2,2,2,1,2,1,2,1,2,3,3,2,2,2,2,2,2,2,2});
        add(indexer, "fc-fl20",   "Frederica Wilson",          "D", "U.S. House",   new float[]{1,2,1,2,1,1,1,2,1,1,2,3,1,1,1,2,2,2,1,2});
        add(indexer, "ms-fl09",   "Maxwell Frost",             "D", "U.S. House",   new float[]{2,2,2,1,2,2,1,1,1,1,2,2,1,1,1,2,2,2,1,1});
        add(indexer, "kc-fl14",   "Kathy Castor",              "D", "U.S. House",   new float[]{2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2});
        add(indexer, "mw-flsd17", "Lori Berman",               "D", "State Senate", new float[]{2,3,2,2,2,2,1,3,1,2,2,3,2,2,2,3,2,3,2,2});
        add(indexer, "rs-fl08",   "Bill Posey",                "R", "U.S. House",   new float[]{4,4,4,4,4,4,4,5,3,4,4,5,3,4,3,4,4,4,4,4});
        add(indexer, "ms-fl01",   "Matt Gaetz",                "R", "U.S. House",   new float[]{5,4,4,5,5,5,5,5,4,3,5,4,4,5,4,4,5,5,5,5});
        add(indexer, "as-fl04",   "Aaron Bean",                "R", "U.S. House",   new float[]{4,4,4,4,5,4,5,4,4,3,4,5,3,4,3,4,4,5,4,4});
        add(indexer, "vs-fl27",   "Maria Salazar",             "R", "U.S. House",   new float[]{4,4,3,3,4,4,4,3,3,3,5,4,3,3,3,3,3,4,3,3});
        add(indexer, "cm-fl26",   "Carlos Gimenez",            "R", "U.S. House",   new float[]{4,4,4,3,4,4,4,4,3,3,5,4,3,4,3,4,4,4,4,3});
        add(indexer, "ds-fl17",   "Scott Franklin",            "R", "U.S. House",   new float[]{4,4,4,4,4,4,4,4,4,3,5,5,3,4,3,4,4,4,4,4});
        add(indexer, "mw-fl05",   "John Rutherford",           "R", "U.S. House",   new float[]{4,4,4,4,4,4,5,5,4,4,4,5,3,4,3,4,4,5,4,4});
        add(indexer, "kc-fl11",   "Daniel Webster",            "R", "U.S. House",   new float[]{4,4,4,4,4,4,5,4,3,4,4,4,3,4,4,4,4,4,4,5});
        add(indexer, "lf-fl22",   "Lois Frankel",              "D", "U.S. House",   new float[]{2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2});
        add(indexer, "cd-fl12",   "Sheila Cherfilus-McCormick","D", "U.S. House",   new float[]{2,2,2,2,1,2,1,1,1,1,2,2,1,1,2,1,2,2,1,1});
        add(indexer, "jm-fl13",   "Anna Paulina Luna",         "R", "U.S. House",   new float[]{5,4,4,4,5,5,5,5,4,3,5,5,4,5,4,4,5,5,4,5});
        add(indexer, "vs-fl16",   "Vern Buchanan",             "R", "U.S. House",   new float[]{5,5,5,4,4,4,4,4,3,3,4,4,3,4,3,4,4,4,4,4});
        add(indexer, "ms-fl06",   "Mike Waltz",                "R", "U.S. House",   new float[]{4,4,4,4,4,4,4,4,3,3,5,5,3,4,3,4,4,5,4,4});
        add(indexer, "ds-fl21",   "Brian Mast",                "R", "U.S. House",   new float[]{4,4,4,4,4,4,5,5,3,3,5,5,3,4,3,4,4,5,4,4});
        add(indexer, "vs-fl07",   "Cory Mills",                "R", "U.S. House",   new float[]{5,4,4,4,5,5,5,5,4,3,5,5,4,4,3,4,5,5,4,5});
        add(indexer, "ds-flag2",  "James Uthmeier",            "R", "Statewide",    new float[]{4,4,4,4,5,5,5,4,4,3,4,5,2,5,3,4,3,5,4,4});
        add(indexer, "cs-flsen",  "Tracie Davis",              "D", "State Senate", new float[]{2,2,2,2,2,2,1,2,1,2,2,3,2,2,2,2,2,2,2,2});
        add(indexer, "mp-flsen",  "Shevrin Jones",             "D", "State Senate", new float[]{2,2,2,2,1,2,1,2,1,1,2,3,1,1,2,2,2,2,1,2});
        add(indexer, "ds-flhs2",  "Daniel Perez",              "R", "State House",  new float[]{4,4,4,4,4,4,4,4,3,3,4,4,3,4,3,4,4,4,4,4});
        add(indexer, "ds-flhs3",  "Anna Eskamani",             "D", "State House",  new float[]{1,2,1,1,1,1,1,1,1,1,2,2,1,1,1,1,2,2,1,1});
        add(indexer, "ml-flsen",  "Joe Gruters",               "R", "State Senate", new float[]{5,5,5,4,5,5,5,4,4,3,5,5,3,4,3,4,5,5,4,5});
    }

    private static void add(LibraryIndexer indexer, String id, String name, String party, String office, float[] v) {
        float[] uniformWeights = new float[20];
        Arrays.fill(uniformWeights, 1.0f);
        indexer.addFigure(new PoliFigure(id, name, party, "FL", office, new PoliVector(
            v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9],
            v[10], v[11], v[12], v[13], v[14], v[15], v[16], v[17], v[18], v[19]
        ), uniformWeights));
    }
}
