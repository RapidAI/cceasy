export namespace main {
	
	export class ProjectConfig {
	    id: string;
	    name: string;
	    path: string;
	    yolo_mode: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ProjectConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.path = source["path"];
	        this.yolo_mode = source["yolo_mode"];
	    }
	}
	export class ModelConfig {
	    model_name: string;
	    model_url: string;
	    api_key: string;
	    is_custom: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ModelConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.model_name = source["model_name"];
	        this.model_url = source["model_url"];
	        this.api_key = source["api_key"];
	        this.is_custom = source["is_custom"];
	    }
	}
	export class AppConfig {
	    current_model: string;
	    project_dir: string;
	    models: ModelConfig[];
	    projects: ProjectConfig[];
	    current_project: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.current_model = source["current_model"];
	        this.project_dir = source["project_dir"];
	        this.models = this.convertValues(source["models"], ModelConfig);
	        this.projects = this.convertValues(source["projects"], ProjectConfig);
	        this.current_project = source["current_project"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class UpdateResult {
	    has_update: boolean;
	    latest_version: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.has_update = source["has_update"];
	        this.latest_version = source["latest_version"];
	    }
	}

}

