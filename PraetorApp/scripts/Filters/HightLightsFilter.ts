module PraetorApp.Filters {

    export class HighLightFilter {

        public static ID = "HighLightFilter";

        public static filter(input: string, termsToHighlight: string): any {
            if (!input)
                return input;
            
            var reg = new RegExp(termsToHighlight, 'gi');
            var ret = input.replace(reg, function (str) { return '<span class="highlight">' + str + '</span>' });                        
            return ret;            
        }
    }
}